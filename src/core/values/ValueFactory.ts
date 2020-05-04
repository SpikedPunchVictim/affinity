import { StringValue } from "./String";
import { IValue } from "./Value";

export type ChangeValueHandler = () => IValue

export interface IValueAttachment {
   request(oldValue: IValue, newValue: IValue, changeValue: ChangeValueHandler): Promise<IValue>
}

export class EmptyValueAttachment implements IValueAttachment {
   async request(oldValue: IValue, newValue: IValue, changeValue: ChangeValueHandler): Promise<IValue> {
      return await changeValue()
   }
}

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