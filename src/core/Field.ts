import { INamedObject, NamedObject } from './NamedObject'
import { IValue } from './values/Value';
import { ArgumentError } from '../errors/ArgumentError';
import { IMember } from './Member';
import { IInstance } from '.';

export enum FieldAttachment {
   Attached = 'attached',
   Detached = 'detahced'
}

export class FieldRestoreInfo {
   name: string = ""
   value: IValue | null = null
   index: number = -1
   attached: FieldAttachment = FieldAttachment.Attached
}

export interface IField extends INamedObject {
   readonly instance: IInstance
   readonly member: IMember
   readonly value: IValue
   readonly id: string  // Inherits the ID from its Member
   readonly attachment: FieldAttachment
   reset(): Promise<void>
}

export class Field extends NamedObject implements IField {
   readonly instance: IInstance
   readonly member: IMember
   readonly value: IValue

   get attachment(): FieldAttachment {
      return this._attachment
   }

   get id(): string {
      return this.member.id
   }

   private _attachment: FieldAttachment = FieldAttachment.Attached

   constructor(instance: IInstance, member: IMember, value: IValue) {
      super(member.name)

      if (value == null) {
         throw new ArgumentError(`value must be valid`)
      }

      this.instance = instance
      this.member = member
      this.value = value
   }

   async reset(): Promise<void> {
      if (this._attachment === FieldAttachment.Attached) {
         return
      }

      this.value.set(this.member.value.clone())
      this._attachment = FieldAttachment.Attached
   }

}