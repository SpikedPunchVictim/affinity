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