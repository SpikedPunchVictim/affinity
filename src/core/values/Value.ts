import { IValueAttachment, EmptyValueAttachment } from "./ValueFactory";
import { NotImplementedError } from "../../errors/NotImplementedError";
import { IMember } from "../Member";
import { IField } from "../Field";

/*
   Note:
   Values don't live by themselves as standalone. They belong
   to another structure (ie Member, Field, List, Enum, etc).
   As such, they are always created/managed from their owning
   containers. This means that Values must contain a reference
   to their parent container in order for their events and
   RfcActions to properly be generated with the right context.
   These contexts are called Attachments. When Values change hands,
   they get Attached to their new parent.
*/
export interface IType {
   readonly name: string
   equals(other: IType): boolean
}

export interface IValue {
   readonly type: IType
   equals(other: IValue): boolean
   clone(): IValue
   attach(attachment: IValueAttachment)
}

export class Value implements IValue {
   readonly type: IType

   get attachment(): IValueAttachment {
      return this._attachment
   }

   private _attachment: IValueAttachment

   constructor(type: IType, attachment: IValueAttachment = new EmptyValueAttachment()) {
      this.type = type
      this._attachment = attachment
   }

   equals(other: IValue): boolean {
      throw new NotImplementedError(`equals() not implements`)
   }

   clone(): IValue {
      throw new NotImplementedError(`clone() not implemented`)
   }

   attach(attachment: IValueAttachment): void {
      this._attachment = attachment
   }
}

export abstract class ValueChange<T> {
   readonly oldValue: IValue
   readonly newValue: IValue
   readonly source: T

   constructor(source: T, oldValue: IValue, newValue: IValue) {
      this.source = source
      this.oldValue = oldValue
      this.newValue = newValue
   }
}

export class MemberValueChange extends ValueChange<IMember> {
   constructor(member: IMember, oldValue: IValue, newValue: IValue) {
      super(member, oldValue, newValue)
   }
}

export class FieldValueChange extends ValueChange<IField> {
   constructor(member: IField, oldValue: IValue, newValue: IValue) {
      super(member, oldValue, newValue)
   }
}