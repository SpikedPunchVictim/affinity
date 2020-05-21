import { IndexOutOfRangeError } from "../../errors/"
import { EventEmitter } from 'events'
import { IndexableItem, ItemAdd, ItemMove, ItemRemove } from './ChangeSets'

export type VisitHandler<T> = (value: T, index: number, array: Array<T>) => void
export type PredicateHandler<T> = (value: T, index: number, array: Array<T>) => boolean
export type OpHandler<T, TChange extends IndexableItem<T>> = (change: TChange[], op: OpAction<T, TChange>) => void
export type OpAction<T, TChange extends IndexableItem<T>> = (change?: TChange[]) => void

//------------------------------------------------------------------------
// Sorts the event response formatted items by index in reverse. ie larger
// indexes appear first.
//------------------------------------------------------------------------
export function sortByIndexReverse<T>(a: IndexableItem<T>, b: IndexableItem<T>): number {
   return sortByIndex(a, b) * -1;
}

//------------------------------------------------------------------------
// Sorts the event response formatted items by index in reverse. ie larger
// indexes appear first.
//------------------------------------------------------------------------
export function sortByIndex<T>(a: IndexableItem<T>, b: IndexableItem<T>): number {
   return a.index - b.index
   // if (a.index > b.index) return 1
   // if (a.index < b.index) return -1
   // return 0
}

export class ObservableEvents {
   static adding: string = 'adding'
   static added: string = 'added'
   static moving: string = 'moving'
   static moved: string = 'moved'
   static movingIn: string = 'movingIn'
   static movedIn: string = 'movedIn'
   static movingOut: string = 'movingOut'
   static movedOut: string = 'movedOut'
   static removing: string = 'removing'
   static removed: string = 'removed'
}

export interface IObservableCollection<T> extends EventEmitter{
   readonly length: number
   [Symbol.iterator](): Iterator<T>
   add(args: T | T[]): Promise<boolean>
   at(index: number): T
   clear(): Promise<boolean>
   contains(item: T): boolean
   filter(visit: VisitHandler<T>): Array<T>
   find(visit: VisitHandler<T>): T | undefined
   forEach(visit: VisitHandler<T>): void
   indexOf(item: T): number | undefined
   insert(index: number, item: T): Promise<boolean>
   map(visit: VisitHandler<T>): void[]
   move(from: number, to: number): Promise<boolean>

   /**
    * Adds items to the collection without raising events
    * 
    * @param items Items to add
    * @param handler Handler that will perform the add
    */
   mutedAdd(items: T | T[], handler: OpHandler<T, ItemAdd<T>>): void

   /**
    * Removes items from the collection without raising events
    * 
    * @param items The items to remove
    * @param handler Handler to perform the removal
    */
   mutedRemove(items: T | T[], handler: OpHandler<T, ItemRemove<T>>): void

   /**
    * Moves the items from the collection without raising events
    * 
    * @param from The index of the current item
    * @param to The destination index
    * @param handler Handler to perform the move
    */
   mutedMove(from: number, to: number, handler: OpHandler<T, ItemMove<T>>): void
   remove(items: T | T[]): Promise<boolean>
   removeAt(index: number): Promise<boolean>
   removeAll(filter: PredicateHandler<T>): Promise<boolean>
   toArray(): T[]
}

export class ObservableChangelist {
   static add<T>(items: T | T[], collection: IObservableCollection<T>): Array<ItemAdd<T>> {
      let change = new Array<ItemAdd<T>>()

      if(!Array.isArray(items)) {
         items = [items]
      }

      for (let i = 0; i < items.length; ++i) {
         let item: T = items[i]
         change.push(new ItemAdd(item, collection.length + i))
      }

      // Sort by index to preserve order when adding
      change.sort(sortByIndex)

      return change
   }

   static move<T>(from: number, to: number, collection: IObservableCollection<T>): Array<ItemMove<T>> {
      if (from < 0 || from >= collection.length) {
         throw new IndexOutOfRangeError(from)
      }

      if (to < 0 || to >= collection.length) {
         throw new IndexOutOfRangeError(to)
      }

      if (from == to) {
         return new Array<ItemMove<T>>()
      }

      let change = new Array<ItemMove<T>>()

      //@ts-ignore
      change.push(new ItemMove(collection.at(from), from, to))

      // Sort by the index they are going to. This prevents
      // items being added at the bottom of the list, and its
      // index being updated by adding an item above it in the list.
      change.sort((a: ItemMove<T>, b: ItemMove<T>) =>  a.to - b.to)

      return change
   }

   static remove<T>(items: T | T[], collection: IObservableCollection<T>): Array<ItemRemove<T>> {
      let changes = new Array<ItemRemove<T>>()

      if(!Array.isArray(items)) {
         items = [items]
      }

      for(let item of items) {
         let itemIndex = collection.indexOf(item)

         if (itemIndex === undefined || itemIndex < 0) {
            continue
         }

         changes.push(new ItemRemove(item, itemIndex))
      }

      // Safely remove the items from the end &
      // sort before raising events
      changes.sort(sortByIndexReverse)

      return changes
   }
}

export class ObservableCollection<T> 
   extends EventEmitter
   implements IObservableCollection<T> {

   protected items: Array<T>

   constructor() {
      super()
      this.items = new Array<T>()
   }

   get length(): number {
      return this.items.length
   }

   [Symbol.iterator](): Iterator<T> {
      let index = 0
      let self = this
      return {
         next(): IteratorResult<T> {
            return index == self.items.length ?
               { value: undefined, done: true } :
               { value: self.items[index++], done: false }
         }
      }
   }

   add(items: T | T[]): Promise<boolean> {
      let change = ObservableChangelist.add(items, this)
      return this._add(change);
   }

   at(index: number): T {
      if(index < 0 || index >= this.items.length) {
         throw new IndexOutOfRangeError(index)
      }

      return this.items[index]
   }

   clear(): Promise<boolean> {
      let change = ObservableChangelist.remove(this.items, this)
      return this._remove(change);
   }

   contains(item: T): boolean {
      return this.items.indexOf(item) >= 0
   }

   filter(visit: VisitHandler<T>): Array<T> {
      return this.items.filter(visit)
   }

   find(visit: VisitHandler<T>): T | undefined {
      return this.items.find(visit)
   }

   forEach(visit: VisitHandler<T>): void {
      return this.items.forEach(visit)
   }

   indexOf(item: T): number | undefined {
      return this.items.indexOf(item)
   }

   insert(index: number, item: T): Promise<boolean> {
      if (index < 0 || index > this.length) {
         throw new IndexOutOfRangeError(index)
      }

      let change = new Array<ItemAdd<T>>()
      change.push(new ItemAdd<T>(item, index))
      
      return this._add(change)
   }

   map(visit: VisitHandler<T>): void[] {
      return this.items.map(visit)
   }

   move(from: number, to: number): Promise<boolean> {
      let change = ObservableChangelist.move(from, to, this)
      return this._move(change)
   }

   mutedAdd(items: T | T[], handler: OpHandler<T, ItemAdd<T>>): void {
      let change = ObservableChangelist.add(items, this)
      handler(change, (ch) => this.performAdd(ch || change))
   }

   mutedRemove(items: T | T[], handler: OpHandler<T, ItemRemove<T>>): void {
      let change = ObservableChangelist.remove(items, this)
      handler(change, (ch) => this.performRemove(ch || change))
   }

   mutedMove(from: number, to: number, handler: OpHandler<T, ItemMove<T>>): void {
      let change = ObservableChangelist.move(from, to, this)
      handler(change, (ch) => this.performRemove(ch || change))
   }

   performAdd(items: Array<ItemAdd<T>>): void {
      // Sort before raising events
      // Add from the front of the Array to the back
      // to preserve intended index ordering
      items.sort(sortByIndex)

      for (var i = 0; i < items.length; ++i) {
         this.items.splice(items[i].index, 0, items[i].item)
      }
   }

   performRemove(items: Array<ItemRemove<T>>): void {
      // Safely remove the items from the end &
      // sort before raising events
      items.sort(sortByIndexReverse)

      for (var i = 0; i < items.length; ++i) {
         this.items.splice(items[i].index, 1)
      }
   }

   performMove(items: Array<ItemMove<T>>): void {
      // Sort by the index they are going to. This prevents
      // items being added at the bottom of the list, and its
      // index being updated by adding an item above it in the list.
      items.sort((a: ItemMove<T>, b: ItemMove<T>) =>  a.to - b.to)

      for (var i = 0; i < items.length; ++i) {
         let current = items[i]
         this.items.splice(current.from, 1)
         this.items.splice(current.to, 0, current.item)
      }
   }

   remove(items: T | T[]): Promise<boolean> {
      let change = ObservableChangelist.remove(items, this)
      return this._remove(change)
   }

   removeAt(index: number): Promise<boolean> {
      if (index < 0 || index >= this.length) {
         throw new Error(`Index out of bouds when removing at index ${index}`)
      }

      let item = this.items[index]

      let change = ObservableChangelist.remove(item, this)
      return this._remove(change)
   }

   removeAll(filter: PredicateHandler<T>): Promise<boolean> {
      if (this.items.length <= 0 || filter == null || filter === undefined) {
         return Promise.resolve(false)
      }

      let toRemove = new Array<T>()

      for (let i = 0; i < this.items.length; ++i) {
         let currentItem = this.items[i]

         if (filter(currentItem, i, this.items)) {
            toRemove.push(currentItem)
         }
      }

      if (toRemove.length == 0) {
         return Promise.resolve(false)
      }

      let change = ObservableChangelist.remove(toRemove, this)
      return this._remove(change)
   }

   toArray(): T[] {
      return this.items
   }

   protected async _add(items: Array<ItemAdd<T>>): Promise<boolean> {
      // Sort before raising events
      // Add from the front of the Array to the back
      // to preserve intended index ordering
      items.sort(sortByIndex)

      this.emit(ObservableEvents.adding, items)

      for (var i = 0; i < items.length; ++i) {
         this.items.splice(items[i].index, 0, items[i].item)
      }

      this.emit(ObservableEvents.added, items)

      return true
   }

   protected async _remove(items: Array<ItemRemove<T>>): Promise<boolean> {
      // Safely remove the items from the end &
      // sort before raising events
      items.sort(sortByIndexReverse)

      this.emit(ObservableEvents.removing, items)

      for (var i = 0; i < items.length; ++i) {
         this.items.splice(items[i].index, 1)
      }

      this.emit(ObservableEvents.removed, items)

      return true
   }

   protected async _move(items: Array<ItemMove<T>>): Promise<boolean> {
      // Sort by the index they are going to. This prevents
      // items being added at the bottom of the list, and its
      // index being updated by adding an item above it in the list.
      items.sort((a: ItemMove<T>, b: ItemMove<T>) =>  a.to - b.to)

      this.emit(ObservableEvents.moving, items)

      for (var i = 0; i < items.length; ++i) {
         let current = items[i]
         this.items.splice(current.from, 1)
         this.items.splice(current.to, 0, current.item)
      }

      this.emit(ObservableEvents.moved, items)

      return items.length > 0
   }
}