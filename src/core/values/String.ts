import { IValue, IType } from "./Value";
import { ArgumentError } from "../../errors";
import { IValueAttachment } from "./ValueAttachment";
import { SimpleValue } from "./SimpleValue";

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

export class StringValue extends SimpleValue<string> {

   constructor(value: string = "", attachment: IValueAttachment) {
      super(value, SingletonStringType, attachment)
   }

   clone(): IValue {
      return new StringValue(this.value, this.attachment)
   }
}