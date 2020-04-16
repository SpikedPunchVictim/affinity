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

export class ObservableOptions {
   ignoreChangeRequest?: boolean

   static defaults(options?: ObservableOptions) {
      options = options || {}
      options.ignoreChangeRequest = options.ignoreChangeRequest || false
      return options
   }
}

export class ObservableEvents {
   static adding: string = 'adding'
   static added: string = 'added'
   static moving: string = 'moving'
   static moved: string = 'moved'
   static removing: string = 'removing'
   static removed: string = 'removed'
}

export class EventMap {
   adding: string = ObservableEvents.adding
   added: string = ObservableEvents.added
   moving: string = ObservableEvents.moving
   moved: string = ObservableEvents.moved
   removing: string = ObservableEvents.removing
   removed: string = ObservableEvents.removed

   constructor(values?: Partial<EventMap>) {
      if(values) {
         Object.keys(values)
            .forEach(k => {
               if(this[k]) {
                  this[k] = values[k]
               }
            })
      }
   }
}

/**
 * This class holds the Change Request Handlers
 * for each type of collection edit. Each edit
 * is verified before being committed.
 */
export class ObservableChangeRequest<T> {
   add: ChangeRequestAddHandler<T> = () => Promise.resolve(true)
   move: ChangeRequestMoveHandler<T> = () => Promise.resolve(true)
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
   clear(options?: ObservableOptions): Promise<boolean>
   remove(items: T | T[]): Promise<boolean>
   removeAt(index: number): Promise<boolean>
   removeAll(filter: PredicateHandler<T>): Promise<boolean>
}

export class ObservableCollection<T> 
   extends EventEmitter
   implements IObservableCollection<T> {

   protected items: Array<T>
   protected eventMap: EventMap
   protected changeRequests: ObservableChangeRequest<T>

   constructor(
      eventMap: EventMap = new EventMap(),
      changeRequests: ObservableChangeRequest<T> = new ObservableChangeRequest<T>()
   ) {
      super()
      this.items = new Array<T>()
      this.eventMap = eventMap
      this.changeRequests = changeRequests
   }

   get length(): number {
      return this.items.length
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

   insert(index: number, item: T, options?: ObservableOptions): Promise<boolean> {
      if (index < 0 || index > this.length) {
         throw new IndexOutOfRangeError(index)
      }

      let change = new Array<ItemAdd<T>>()
      change.push(new ItemAdd<T>(item, index))
      
      return this._add(change, options)
   }

   add(args: T | T[], options?: ObservableOptions): Promise<boolean> {
      var change = new Array<ItemAdd<T>>()

      if(!Array.isArray(args)) {
         args = [args]
      }

      for (var i = 0; i < args.length; ++i) {
         let item: T = args[i]
         change.push(new ItemAdd(item, this.length + i))
      }

      return this._add(change, options);
   }

   move(from: number, to: number, options?: ObservableOptions): Promise<boolean> {
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
      return this._move(change, options)
   }

   clear(options?: ObservableOptions): Promise<boolean> {
      let changes = new Array<ItemRemove<T>>()

      for (let i = 0; i < this.items.length; ++i) {
         changes.push(new ItemRemove(this.items[i], i))
      }

      return this._remove(changes, options);
   }

   remove(items: T | T[], options?: ObservableOptions): Promise<boolean> {
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

      return this._remove(changes, options);
   }

   removeAt(index: number, options?: ObservableOptions): Promise<boolean> {
      if (index < 0 || index >= this.length) {
         throw new Error(`Index out of bouds when removing at index ${index}`)
      }

      let item = this.items[index]

      let changes = new Array<ItemRemove<T>>()
      changes.push(new ItemRemove(item, index))

      return this._remove(changes, options)
   }

   removeAll(filter: PredicateHandler<T>, options?: ObservableOptions): Promise<boolean> {
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

      return this._remove(toRemove, options)
   }

   protected async _add(items: Array<ItemAdd<T>>, options?: ObservableOptions): Promise<boolean> {
      // Sort before raising events
      // Add from the front of the Array to the back
      // to preserve intended index ordering
      items.sort(sortByIndex)

      options = ObservableOptions.defaults(options)

      if(options.ignoreChangeRequest === false) {
         let allowed = await this.changeRequests.add(items, this.items)

         if(!allowed) {
            return false
         }
      }

      this.emit(this.eventMap.adding, items)

      for (var i = 0; i < items.length; ++i) {
         this.items.splice(items[i].index, 0, items[i].item)
      }

      this.emit(this.eventMap.added, items)

      return true
   }

   protected async _remove(items: Array<ItemRemove<T>>, options?: ObservableOptions): Promise<boolean> {
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

   protected async _move(items: Array<ItemMove<T>>, options?: ObservableOptions): Promise<boolean> {
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
}