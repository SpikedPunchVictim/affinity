export class IndexableItem<T> {
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
