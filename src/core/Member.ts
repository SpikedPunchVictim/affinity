import { INamedObject, NamedObject } from './NamedObject'
import { IValue } from './Value';
import { ArgumentError } from '../errors/ArgumentError';

export interface IMember extends INamedObject {
   readonly name: string
   readonly value: IValue
}

export class Member extends NamedObject {
   readonly value: IValue

   constructor(name: string, value: IValue) {
      super(name)

      if(value == null) {
         throw new ArgumentError(`value must be valid`)
      }

      this.value = value
   }
}