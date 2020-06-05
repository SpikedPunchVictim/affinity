import { INamedObject, NamedObject } from './NamedObject'
import { IValue } from './values/Value';
import { ArgumentError } from '../errors/ArgumentError';
import { IMember } from './Member';
import { IInstance } from './Instance';
import { Events } from './Events';
import { FieldAttachmentChangeAction, FieldValueChangeAction } from './actions/Instance'

export enum FieldAttachment {
   Attached = 'attached',
   Detached = 'detahced'
}

export class FieldRestoreInfo {
   name: string = ""
   id: string = ""
   value: IValue
   index: number = -1
   attached: FieldAttachment = FieldAttachment.Attached

   constructor(name: string, id: string, value: IValue, index: number, attached: FieldAttachment) {
      this.name = name
      this.id = id
      this.value = value
      this.index = index
      this.attached = attached
   }
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

      this.internalSetValue(this.member.value)
      this.internalSetAttachment(FieldAttachment.Attached)
   }

   internalSetAttachment(attachment: FieldAttachment): void {
      if(this.attachment == attachment) {
         return
      }

      let action = new FieldAttachmentChangeAction(this, this.attachment, attachment)
      this.emit(Events.Field.AttachmentChanging, action)
      this._attachment = attachment
      this.emit(Events.Field.AttachmentChanged, action)
   }

   internalSetValue(value: IValue): void {
      if(this.value.equals(value)) {
         return
      }

      let action = new FieldValueChangeAction(this, this.value, value)
      this.emit(Events.Field.ValueChanging, action)
      this.value.internalSet(value.clone())
      this.emit(Events.Field.ValueChanged, action)
   }
}