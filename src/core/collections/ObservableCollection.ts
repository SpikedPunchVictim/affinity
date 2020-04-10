import { IndexOutOfRangeError } from "../../errors/IndexOutOfRangeError"
import { EventEmitter } from 'events'

type VisitHandler<T> = (value: T, index: number, array: Array<T>) => void

//------------------------------------------------------------------------
// Sorts the event response formatted items by index in reverse. ie larger
// indexes appear first.
//------------------------------------------------------------------------
// function sortByIndexReverse<T extends IndexableItem<T>>(a: T, b: T): number {
//    return sortByIndex(a, b) * -1;
// }

//------------------------------------------------------------------------
// Sorts the event response formatted items by index in reverse. ie larger
// indexes appear first.
//------------------------------------------------------------------------
function sortByIndex<T>(a: IndexableItem<T>, b: IndexableItem<T>): number {
   if (a.index > b.index) return 1
   if (a.index < b.index) return -1
   return 0
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

export class ItemMove<T> {
   readonly item: T
   readonly from: number
   readonly to: number

   constructor(item: T, from: number, to: number) {
      this.item = item
      this.from = from
      this.to = to
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

export class ObservableCollection<T> extends EventEmitter {
   protected items: Array<T>
   readonly eventMap: EventMap

   constructor(eventMap: EventMap = new EventMap()) {
      super()
      this.items = new Array<T>()
      this.eventMap = eventMap
   }

   get length() {
      return this.items.length
   }

   at(index: number) {
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

   insert(index: number, item: T): void {
      if (index < 0 || index > this.length) {
         throw new IndexOutOfRangeError(index)
      }

      let change = new Array<ItemAdd<T>>()
      change.push(new ItemAdd<T>(item, index))
      this._add(change)
   }

   add(...args: T[]) {
      var change = new Array<ItemAdd<T>>();

      for (var i = 0; i < args.length; ++i) {
         let item: T = args[i]
         change.push(new ItemAdd(item, this.length + i))
      }

      this._add(change);
   }

   // move(from: number, to: number) {
   //    if (from < 0 || from >= this.length) {
   //       throw new IndexOutOfRangeError(from)
   //    }

   //    if (to < 0 || to >= this.length) {
   //       throw new IndexOutOfRangeError(to)
   //    }

   //    if (from == to) {
   //       return;
   //    }

   //    let change = new Array<ItemMove<T>>()
   //    change.push(new ItemMove(this.items[from], from, to))
   //    this._move(change);
   // }

   // clear() {
   //    var change = []
   //    for (var i = 0; i < this._items.length; ++i) {
   //       change.push({
   //          item: this._items[i],
   //          index: i
   //       });
   //    }

   //    this._remove(change);
   // }

   // remove(item) {
   //    var change = []
   //    for (var i = 0; i < arguments.length; ++i) {
   //       var current = arguments[i];
   //       var itemIndex = this._items.indexOf(current);

   //       if (itemIndex < 0) {
   //          continue;
   //       }

   //       change.push({
   //          item: current,
   //          index: itemIndex
   //       });
   //    }

   //    this._remove(change);
   // }

   // removeAt(index) {
   //    if (index < 0 || index >= this.length) {
   //       throw new Error(util.format('Index out of bouds when removing at index %s', index));
   //    }
   //    var item = this._items[index];

   //    var change = [];
   //    change.push({
   //       item: item,
   //       index: index
   //    });

   //    this._remove(change);
   // }

   // // filter(item, index, collection)
   // removeAll(filter) {
   //    if (this._items.length <= 0 || filter == null || filter === undefined) {
   //       return false;
   //    }

   //    // Error?
   //    if (!_.isFunction(filter)) {
   //       return false;
   //    }

   //    var toRemove = [];
   //    for (var i = 0; i < this._items.length; ++i) {
   //       var currentItem = this._items[i];
   //       if (filter(currentItem, i, this)) {
   //          toRemove.push({
   //             item: currentItem,
   //             index: i
   //          });
   //       }
   //    }

   //    if (toRemove.length == 0) {
   //       return false;
   //    }

   //    this._remove(toRemove);
   //    return true;
   // }

   private _add(items: Array<ItemAdd<T>>) {
      // Sort before raising events
      // Add from the front of the Array to the back
      // to preserve intended index ordering
      items.sort(sortByIndex)

      super.emit(this.eventMap.adding, items)

      for (var i = 0; i < items.length; ++i) {
         this.items.splice(items[i].index, 0, items[i].item)
      }

      super.emit(this.eventMap.added, items)
   }

   // private _move(items) {
   //    this._onMoving(items);

   //    for (var i = 0; i < items.length; ++i) {
   //       let current = items[i];
   //       this._items.splice(current.from, 1);
   //       this._items.splice(current.to, 0, current.item);
   //    }

   //    this._onMoved(items);
   // }

}