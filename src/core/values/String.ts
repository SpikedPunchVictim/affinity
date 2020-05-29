import { IValue, IType } from "./Value";
import { ArgumentError } from "../../errors";
import { IValueAttachment, EmptyValueAttachment } from "./ValueAttachment";
import { SimpleValue, SimpleValueSource } from "./SimpleValue";

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

export class StringValueSource extends SimpleValueSource<string> {
   constructor() {
      super(SingletonStringType, (val: string) => new StringValue(val, new EmptyValueAttachment()))
   }
}