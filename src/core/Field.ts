import { INamedObject, NamedObject } from './NamedObject'
import { IValue } from './values/Value';
import { ArgumentError } from '../errors/ArgumentError';
import { IMember } from './Member';
import { IInstance } from '.';

export interface IField extends INamedObject {
   readonly instance: IInstance
   readonly member: IMember
   readonly value: IValue
}

export class Field extends NamedObject {
   readonly instance: IInstance
   readonly member: IMember
   readonly value: IValue

   constructor(instance: IInstance, member: IMember, value: IValue) {
      super(member.name)

      if(value == null) {
         throw new ArgumentError(`value must be valid`)
      }

      this.instance = instance
      this.member = member
      this.value = value
   }
}