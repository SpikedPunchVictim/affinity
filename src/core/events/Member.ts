import { IMember } from "../Member"
import { MoveEvent, RenameEvent } from "./Base"

/*
   Events:
      Rename
      Move
      ChangeValue
      Add
      Remove
*/

export class MemberRenaming extends RenameEvent<IMember> {
   constructor(member: IMember, from: string, to: string) {
      super('member-renaming', member, from, to)
   }
}

export class MemberRenamed extends RenameEvent<IMember> {
   constructor(member: IMember, from: string, to: string) {
      super('member-renamed', member, from, to)
   }
}

export class MemberMoving extends MoveEvent<IMember> {
   constructor(member: IMember, from: number, to: number) {
      super('member-moving', member, from, to)
   }
}

export class MemberMoved extends MoveEvent<IMember> {
   constructor(member: IMember, from: number, to: number) {
      super('member-moved', member, from, to)
   }
}