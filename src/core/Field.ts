import { INamedObject, NamedObject } from './NamedObject'
import { IValue } from './Value';
import { ArgumentError } from '../errors/ArgumentError';
import { IMember } from './Member';
import { IInstance } from '.';

export interface IField extends INamedObject {
   readonly parent: IInstance
   readonly member: IMember
   readonly value: IValue
}

export class Field extends NamedObject {
   readonly parent: IInstance
   readonly member: IMember
   readonly value: IValue

   constructor(parent: IInstance, member: IMember, value: IValue) {
      super(member.name)

      if(value == null) {
         throw new ArgumentError(`value must be valid`)
      }

      this.parent = parent
      this.member = member
      this.value = value
   }
}