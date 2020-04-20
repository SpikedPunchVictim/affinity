import { IndexOutOfRangeError } from "../../errors/"
import { EventEmitter } from 'events'

export type VisitHandler<T> = (value: T, index: number, array: Array<T>) => void
export type PredicateHandler<T> = (value: T, index: number, array: Array<T>) => boolean
export type ChangeRequestAddHandler<T> = (items: Array<ItemAdd<T>>, array: Array<T>) => Promise<boolean>
export type ChangeRequestRemoveHandler<T> = (items: Array<ItemRemove<T>>, array: Array<T>) => Promise<boolean>
export type ChangeRequestMoveHandler<T> = (items: Array<ItemMove<T>>, array: Array<T>) => Promise<boolean>

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

abstract class IndexableItem<T> {
   readonly item: T
   readonly index: number

   constructor(item: T, index: number) {
      this.item = item
      this.index = index
   }
}

export class ItemAdd<T> extends IndexableItem<T> {
   constructor(item: T, index: number) {
      super(item, index)
   }
}

export class ItemRemove<T> extends IndexableItem<T> {
   constructor(item: T, index: number) {
      super(item, index)
   }
}

export class ItemMove<T> extends IndexableItem<T> {
   readonly item: T
   readonly from: number
   readonly to: number

   constructor(item: T, from: number, to: number) {
      super(item, from)
      this.item = item
      this.from = from
      this.to = to
   }
}

// export class ObservableOptions {
//    ignoreChangeRequest?: boolean

//    static defaults() {
//       options = options || {}
//       options.ignoreChangeRequest = options.ignoreChangeRequest || false
//       return options
//    }
// }

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

// export class EventMap {
//    adding: string = ObservableEvents.adding
//    added: string = ObservableEvents.added
//    moving: string = ObservableEvents.moving
//    moved: string = ObservableEvents.moved
//    movingIn: string = ObservableEvents.movingIn
//    movedIn: string = ObservableEvents.movedIn
//    movingOut: string = ObservableEvents.movingOut
//    movedOut: string = ObservableEvents.movedOut
//    removing: string = ObservableEvents.removing
//    removed: string = ObservableEvents.removed

//    constructor(values?: Partial<EventMap>) {
//       if(values) {
//          Object.keys(values)
//             .forEach(k => {
//                if(this[k]) {
//                   this[k] = values[k]
//                }
//             })
//       }
//    }
// }

/**
 * This class holds the Change Request Handlers
 * for each type of collection edit. Each edit
 * is verified before being committed.
 */
export class ObservableChangeRequest<T> {
   add: ChangeRequestAddHandler<T> = () => Promise.resolve(true)
   move: ChangeRequestMoveHandler<T> = () => Promise.resolve(true)
   moveIn: ChangeRequestAddHandler<T> = () => Promise.resolve(true)
   moveOut: ChangeRequestRemoveHandler<T> = () => Promise.resolve(true)
   remove: ChangeRequestRemoveHandler<T> = () => Promise.resolve(true)

   constructor(handlers?: Partial<ObservableChangeRequest<T>>) {
      if(handlers) {
         Object.keys(handlers)
            .forEach(k => {
               if(this[k]) {
                  this[k] = handlers[k]
               }
            })
      }
   }
}

export interface IObservableCollection<T> {
   readonly length: number
   at(index: number): T | undefined
   forEach(visit: VisitHandler<T>): void
   map(visit: VisitHandler<T>): void[]
   indexOf(item: T): number | undefined
   contains(item: T): boolean
   find(visit: VisitHandler<T>): T | undefined
   filter(visit: VisitHandler<T>): Array<T>
   insert(index: number, item: T): Promise<boolean>
   add(args: T | T[]): Promise<boolean>
   move(from: number, to: number): Promise<boolean>
   moveIn(item: T): Promise<boolean>
   moveOut(item: T): Promise<boolean>
   clear(): Promise<boolean>
   remove(items: T | T[]): Promise<boolean>
   removeAt(index: number): Promise<boolean>
   removeAll(filter: PredicateHandler<T>): Promise<boolean>
}

export class ObservableCollection<T> 
   extends EventEmitter
   implements IObservableCollection<T> {

   protected items: Array<T>
   protected changeRequests: ObservableChangeRequest<T>

   constructor(
      changeRequests: ObservableChangeRequest<T> = new ObservableChangeRequest<T>()
   ) {
      super()
      this.items = new Array<T>()
      this.changeRequests = changeRequests
   }

   get length(): number {
      return this.items.length
   }

   createAddChangelist(items: T | T[]): ItemAdd<T>[] {
      let change = new Array<ItemAdd<T>>()

      if(!Array.isArray(items)) {
         items = [items]
      }

      for (let i = 0; i < items.length; ++i) {
         let item: T = items[i]
         change.push(new ItemAdd(item, this.length + i))
      }

      // Sort by index to preserve order when adding
      change.sort(sortByIndex)

      return change
   }

   createMoveChangelist(from: number, to: number): Array<ItemMove<T>> {
      if (from < 0 || from >= this.length) {
         throw new IndexOutOfRangeError(from)
      }

      if (to < 0 || to >= this.length) {
         throw new IndexOutOfRangeError(to)
      }

      if (from == to) {
         return new Array<ItemMove<T>>()
      }

      let change = new Array<ItemMove<T>>()
      change.push(new ItemMove(this.items[from], from, to))

      // Sort by the index they are going to. This prevents
      // items being added at the bottom of the list, and its
      // index being updated by adding an item above it in the list.
      change.sort((a: ItemMove<T>, b: ItemMove<T>) =>  a.to - b.to)

      return change
   }

   createRemoveChangelist(items: T | T[]): Array<ItemRemove<T>> {
      let changes = new Array<ItemRemove<T>>()

      if(!Array.isArray(items)) {
         items = [items]
      }

      for(let item of items) {
         let itemIndex = this.items.indexOf(item)

         if (itemIndex < 0) {
            continue
         }

         changes.push(new ItemRemove(item, itemIndex))
      }

      return changes
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

   at(index: number): T | undefined {
      return this.items[index]
   }

   forEach(visit: VisitHandler<T>): void {
      return this.items.forEach(visit)
   }

   map(visit: VisitHandler<T>): void[] {
      return this.items.map(visit)
   }

   indexOf(item: T): number | undefined {
      return this.items.indexOf(item)
   }

   contains(item: T): boolean {
      return this.items.indexOf(item) >= 0
   }

   find(visit: VisitHandler<T>): T | undefined {
      return this.items.find(visit)
   }

   filter(visit: VisitHandler<T>): Array<T> {
      return this.items.filter(visit)
   }

   insert(index: number, item: T): Promise<boolean> {
      if (index < 0 || index > this.length) {
         throw new IndexOutOfRangeError(index)
      }

      let change = new Array<ItemAdd<T>>()
      change.push(new ItemAdd<T>(item, index))
      
      return this._add(change)
   }

   add(args: T | T[]): Promise<boolean> {
      var change = new Array<ItemAdd<T>>()

      if(!Array.isArray(args)) {
         args = [args]
      }

      for (var i = 0; i < args.length; ++i) {
         let item: T = args[i]
         change.push(new ItemAdd(item, this.length + i))
      }

      return this._add(change);
   }

   move(from: number, to: number): Promise<boolean> {
      if (from < 0 || from >= this.length) {
         throw new IndexOutOfRangeError(from)
      }

      if (to < 0 || to >= this.length) {
         throw new IndexOutOfRangeError(to)
      }

      if (from == to) {
         return Promise.resolve(false)
      }

      let change = new Array<ItemMove<T>>()
      change.push(new ItemMove(this.items[from], from, to))
      return this._move(change)
   }

   moveOut(item: T): Promise<boolean> {
      let index = this.items.indexOf(item)

      if(index === undefined) {
         throw new Error(`item does not exist in this collection`)
      }

      let changes = new Array<ItemRemove<T>>(new ItemRemove<T>(item, index))
      return this._moveOut(changes)
   }

   moveIn(item: T): Promise<boolean> {
      let exists = this.items.indexOf(item) >= 0

      if(exists) {
         return Promise.resolve(true)
      }

      let change = new ItemAdd<T>(item, Math.max(0, this.items.length - 1))
      let changes = new Array<ItemAdd<T>>(change)
      
      return this._moveIn(changes)
   }

   clear(): Promise<boolean> {
      let changes = new Array<ItemRemove<T>>()

      for (let i = 0; i < this.items.length; ++i) {
         changes.push(new ItemRemove(this.items[i], i))
      }

      return this._remove(changes);
   }

   remove(items: T | T[]): Promise<boolean> {
      let changes = new Array<ItemRemove<T>>()

      if(!Array.isArray(items)) {
         items = [items]
      }

      for(let item of items) {
         let itemIndex = this.items.indexOf(item)

         if (itemIndex < 0) {
            continue
         }

         changes.push(new ItemRemove(item, itemIndex))
      }

      return this._remove(changes);
   }

   removeAt(index: number): Promise<boolean> {
      if (index < 0 || index >= this.length) {
         throw new Error(`Index out of bouds when removing at index ${index}`)
      }

      let item = this.items[index]

      let changes = new Array<ItemRemove<T>>()
      changes.push(new ItemRemove(item, index))

      return this._remove(changes)
   }

   removeAll(filter: PredicateHandler<T>): Promise<boolean> {
      if (this.items.length <= 0 || filter == null || filter === undefined) {
         return Promise.resolve(false)
      }

      let toRemove = new Array<ItemRemove<T>>()

      for (let i = 0; i < this.items.length; ++i) {
         let currentItem = this.items[i]

         if (filter(currentItem, i, this.items)) {
            toRemove.push(new ItemRemove(currentItem, i))
         }
      }

      if (toRemove.length == 0) {
         return Promise.resolve(false)
      }

      return this._remove(toRemove)
   }

   protected async _add(items: Array<ItemAdd<T>>): Promise<boolean> {
      // Sort before raising events
      // Add from the front of the Array to the back
      // to preserve intended index ordering
      items.sort(sortByIndex)

      this.emit(this.eventMap.adding, items)

      for (var i = 0; i < items.length; ++i) {
         this.items.splice(items[i].index, 0, items[i].item)
      }

      this.emit(this.eventMap.added, items)

      return true
   }

   protected async _remove(items: Array<ItemRemove<T>>): Promise<boolean> {
      options = ObservableOptions.defaults(options)

      // Safely remove the items from the end &
      // sort before raising events
      items.sort(sortByIndexReverse)

      if(options.ignoreChangeRequest === false) {
         let allowed = await this.changeRequests.remove(items, this.items)

         if(!allowed) {
            return false
         }
      }

      this.emit(this.eventMap.removing, items)

      for (var i = 0; i < items.length; ++i) {
         this.items.splice(items[i].index, 1)
      }

      this.emit(this.eventMap.removed, items)

      return true
   }

   protected async _move(items: Array<ItemMove<T>>): Promise<boolean> {
      options = ObservableOptions.defaults(options)

      // Sort by the index they are going to. This prevents
      // items being added at the bottom of the list, and its
      // index being updated by adding an item above it in the list.
      items.sort((a: ItemMove<T>, b: ItemMove<T>) =>  a.to - b.to)

      if(options.ignoreChangeRequest === false) {
         let allowed = await this.changeRequests.move(items, this.items)

         if(!allowed) {
            return false
         }
      }

      this.emit(this.eventMap.moving, items)

      for (var i = 0; i < items.length; ++i) {
         let current = items[i]
         this.items.splice(current.from, 1)
         this.items.splice(current.to, 0, current.item)
      }

      this.emit(this.eventMap.moved, items)

      return items.length > 0
   }

   protected async _moveIn(items: Array<ItemAdd<T>>): Promise<boolean> {
      options = ObservableOptions.defaults(options)

      items.sort(sortByIndex)

      if(options.ignoreChangeRequest === false) {
         let allowed = await this.changeRequests.moveIn(items, this.items)

         if(!allowed) {
            return false
         }
      }

      this.emit(this.eventMap.movingIn, items)

      for (var i = 0; i < items.length; ++i) {
         this.items.splice(items[i].index, 0, items[i].item)
      }

      this.emit(this.eventMap.movedIn, items)

      return true
   }

   protected async _moveOut(items: Array<ItemRemove<T>>): Promise<boolean> {
      options = ObservableOptions.defaults(options)

      items.sort(sortByIndexReverse)

      if(options.ignoreChangeRequest === false) {
         let allowed = await this.changeRequests.moveOut(items, this.items)

         if(!allowed) {
            return false
         }
      }

      this.emit(this.eventMap.movingOut, items)

      for (var i = 0; i < items.length; ++i) {
         this.items.splice(items[i].index, 1)
      }

      this.emit(this.eventMap.movedOut, items)

      return true
   }
}