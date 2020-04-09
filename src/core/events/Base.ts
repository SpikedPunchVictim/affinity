export interface IEvent {
   readonly name: string
}

/*
   Events:
      Rename
      Move
      ChangeValue
      Add
      Remove
*/

// abstract class AddEvent<T> implements IEvent {

// }

abstract class Event implements IEvent {
   readonly name: string

   constructor(name: string) {
      this.name = name
   }
}

export abstract class MoveEvent<T> extends Event {
   readonly item: T
   readonly from: number
   readonly to: number

   constructor(name: string, item: T, from: number, to: number) {
      super(name)
      this.item = item
      this.from = from
      this.to = to
   }
}

export abstract class RenameEvent<T> extends Event {
   readonly item: T
   readonly from: string
   readonly to: string

   constructor(name: string, item: T, from: string, to: string) {
      super(name)
      this.item = item
      this.from = from
      this.to = to
   }
}