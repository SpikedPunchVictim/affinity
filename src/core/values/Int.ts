import { IType, IValue } from "./Value"
import { ArgumentError } from "../../errors/ArgumentError"
import { IValueAttachment } from "./ValueFactory"
import { SimpleValue } from "./SimpleValue"

export class IntType implements IType {
   readonly name: string = "type-int"

   constructor() {
   }

   equals(other: IType): boolean {
      if(other == null) {
         throw new ArgumentError(`other value must be valid`)
      }

      return other.name === this.name
   }
}

const SingletonIntType = new IntType()

export class IntValue extends SimpleValue<number> {

   constructor(value: number = 0, attachment: IValueAttachment) {
      super(value, SingletonIntType, attachment)
      this._value = value
   }

   clone(): IValue {
      return new IntValue(this.value, this.attachment)
   }
}