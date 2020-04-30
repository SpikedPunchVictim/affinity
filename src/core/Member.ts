import { INamedObject, NamedObject } from './NamedObject'
import { IValue } from './Value';
import { ArgumentError } from '../errors/ArgumentError';
import { IModel } from './Model';

export interface IMember extends INamedObject {
   readonly model: IModel
   readonly value: IValue
}

export class Member 
   extends NamedObject
   implements IMember {
   readonly model: IModel
   readonly value: IValue

   constructor(model: IModel, name: string, value: IValue) {
      super(name)

      if(model == null) {
         throw new ArgumentError(`model must be valid`)
      }

      if(value == null) {
         throw new ArgumentError(`value must be valid`)
      }

      this.model = model
      this.value = value
   }
}