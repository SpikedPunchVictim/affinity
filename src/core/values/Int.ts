import { IType, Value, IValue } from "./Value"
import { ArgumentError } from "../../errors/ArgumentError"
import { asValue } from "../utils/Types"
import { IValueAttachment } from "./ValueFactory"

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

export class IntValue extends Value {
   private _value: number

   get value(): number {
      return this._value
   }

   constructor(value: number = 0, updater: IValueAttachment) {
      super(SingletonIntType, updater)
      this._value = value
   }

   equals(other: IValue): boolean {
      if(other == null) {
         throw new ArgumentError(`other value must be valid`)
      }

      return this.type.equals(other.type) && this.value === asValue<IntValue>(other).value
   }

   clone(): IValue {
      return new IntValue(this.value, this.attachment)
   }

   async update(other: IValue): Promise<IValue> {
      if(other == null) {
         throw new ArgumentError(`other value must be valid`)
      }

      if(!other.type.equals(this.type)) {
         throw new ArgumentError(`Cannot update a IntValue with an incompatible value`)
      }

      return await this.attachment.request(other, this, () => {
         let intVal = asValue<IntValue>(other)
         this._value = intVal.value
         return this
      })
   }
}