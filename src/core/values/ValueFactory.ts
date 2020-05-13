import { StringValue } from "./String"
import { IValueAttachment } from "./ValueAttachment"

export interface IValueFactory {
   string(value: string): StringValue
}

export class ValueFactory implements IValueFactory {
   readonly attachment: IValueAttachment

   constructor(attachment: IValueAttachment) {
      this.attachment = attachment
   }

   string(value: string): StringValue {
      return new StringValue(value, this.attachment)
   }
}