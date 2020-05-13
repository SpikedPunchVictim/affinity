import { IValue } from './Value'
import { IMember } from "../Member";
import { IField } from "../Field";

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