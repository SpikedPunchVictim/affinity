import { IType, IValue, Value } from "./Value"
import { ArgumentError } from "../../errors/ArgumentError"
import { asValue } from "../utils/Types"
import { IValueAttachment } from "./ValueFactory"

export class BoolType implements IType {
   readonly name: string = "type-bool"

   constructor() {
   }

   equals(other: IType): boolean {
      if(other == null) {
         throw new ArgumentError(`other value must be valid`)
      }

      return other.name === this.name
   }
}

const SingletonBoolType = new BoolType()

export class BoolValue extends Value {
   private _value: boolean

   get value(): boolean {
      return this._value
   }

   constructor(value: boolean = true, updater: IValueAttachment) {
      super(SingletonBoolType, updater)
      this._value = value
   }

   equals(other: IValue): boolean {
      if(other == null) {
         throw new ArgumentError(`other value must be valid`)
      }

      return this.type.equals(other.type) && this.value === asValue<BoolValue>(other).value
   }

   clone(): IValue {
      return new BoolValue(this.value, this.attachment)
   }

   async update(other: IValue): Promise<IValue> {
      if(other == null) {
         throw new ArgumentError(`other value must be valid`)
      }

      if(!other.type.equals(this.type)) {
         throw new ArgumentError(`Cannot update a BoolValue with an incompatible value`)
      }

      return await this.attachment.request(other, this, () => {
         let boolVal = asValue<BoolValue>(other)
         this._value = boolVal.value
         return this
      })
   }
}