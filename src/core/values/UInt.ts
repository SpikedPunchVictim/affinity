import { IType, Value, IValue } from "./Value"
import { ArgumentError } from "../../errors/ArgumentError"
import { asValue } from "../utils/Types"
import { IValueAttachment } from "./ValueFactory"

export class UIntType implements IType {
   readonly name: string = "type-uint"

   constructor() {
   }

   equals(other: IType): boolean {
      if(other == null) {
         throw new ArgumentError(`other value must be valid`)
      }

      return other.name === this.name
   }
}

const SingletonUIntType = new UIntType()

export class UIntValue extends Value {
   private _value: number

   get value(): number {
      return this._value
   }

   constructor(value: number = 0, updater: IValueAttachment) {
      super(SingletonUIntType, updater)

      if(value < 0) {
         throw new ArgumentError(`value must be positive`)
      }

      this._value = value
   }

   equals(other: IValue): boolean {
      if(other == null) {
         throw new ArgumentError(`other value must be valid`)
      }

      return this.type.equals(other.type) && this.value === asValue<UIntValue>(other).value
   }

   clone(): IValue {
      return new UIntValue(this.value, this.attachment)
   }

   async update(other: IValue): Promise<IValue> {
      if(other == null) {
         throw new ArgumentError(`other value must be valid`)
      }

      if(!other.type.equals(this.type)) {
         throw new ArgumentError(`Cannot update a IntValue with an incompatible value`)
      }

      let uintValue = asValue<UIntValue>(other)

      if(uintValue.value < 0) {
         throw new ArgumentError(`Cannot assign negative values to a UInt value`)
      }

      return await this.attachment.request(other, this, () => {
         let strValue = asValue<UIntValue>(other)
         this._value = strValue.value
         return this
      })
   }
}