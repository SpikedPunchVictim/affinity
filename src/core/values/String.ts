import { IValue, IType, Value } from "./Value";
import { ArgumentError } from "../../errors";
import { asValue } from "../utils/Types";
import { IValueAttachment } from "./ValueFactory";


export class StringType implements IType {
   readonly name: string = "type-string"

   constructor() {
   }

   equals(other: IType): boolean {
      if(other == null) {
         throw new ArgumentError(`other value must be valid`)
      }

      return other.name === this.name
   }
}

const SingletonStringType = new StringType()

export class StringValue extends Value {
   private _value: string

   get value(): string {
      return this._value
   }

   constructor(value: string = "", updater: IValueAttachment) {
      super(SingletonStringType, updater)
      this._value = value
   }

   equals(other: IValue): boolean {
      if(other == null) {
         throw new ArgumentError(`other value must be valid`)
      }

      return this.type.equals(other.type) && this.value === asValue<StringValue>(other).value
   }

   clone(): IValue {
      return new StringValue(this.value, this.attachment)
   }

   async update(other: IValue): Promise<IValue> {
      if(other == null) {
         throw new ArgumentError(`other value must be valid`)
      }

      if(!other.type.equals(this.type)) {
         throw new ArgumentError(`Cannot update a StringValue with an incompatible value`)
      }

      return await this.attachment.request(other, this, () => {
         let strValue = asValue<StringValue>(other)
         this._value = strValue.value
         return this
      })
   }
}