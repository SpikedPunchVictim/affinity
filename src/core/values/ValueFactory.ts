import { StringValue, StringValueSource } from "./String"
import { IValueAttachment } from "./ValueAttachment"
import { IValue, IType } from "./Value"
import { UIntValue, UIntValueSource } from "./UInt"
import { IntValue, IntValueSource } from "./Int"
import { BoolValue, BoolValueSource } from "./Bool"
import { ListValue, ListValueSource } from "./List"

/*
types.string.type()
types.string.value(val: string)

*/

export interface IValueSource {
   readonly bool: BoolValueSource
   readonly int: IntValueSource
   readonly list: ListValueSource
   readonly string: StringValueSource
   readonly uint: UIntValueSource
}

/*
This is intended to be the main way for developers to create values
*/
export class ValueSource implements IValueSource {
   readonly bool: BoolValueSource = new BoolValueSource()
   readonly int: IntValueSource = new IntValueSource()
   readonly list: ListValueSource = new ListValueSource()
   readonly string: StringValueSource = new StringValueSource()
   readonly uint: UIntValueSource = new UIntValueSource()
}

export interface IValueFactory {
   from(other: string | number | boolean): IValue
   string(value: string): StringValue
   bool(value: boolean): BoolValue
   uint(value: number): UIntValue
   int(value: number): IntValue
   array(itemType: IType): ListValue
}

export class ValueFactory implements IValueFactory {
   readonly attachment: IValueAttachment

   constructor(attachment: IValueAttachment) {
      this.attachment = attachment
   }

   from(other: string | number | boolean): IValue {
      if(typeof other === "string") {
         return new StringValue(other, this.attachment)
      }

      if(typeof other === "number") {
         if(<number>other >= 0) {
            return new UIntValue(other, this.attachment)
         } else {
            return new IntValue(other, this.attachment)
         }
      }

      if(typeof other === "boolean") {
         return new BoolValue(other, this.attachment)
      }

      throw new Error(`Unsupported Value type: ${typeof other}`)
   }

   string(value: string): StringValue {
      return new StringValue(value, this.attachment)
   }

   bool(value: boolean): BoolValue {
      return new BoolValue(value, this.attachment)
   }

   uint(value: number): UIntValue {
      return new UIntValue(value, this.attachment)
   }

   int(value: number): IntValue {
      return new IntValue(value, this.attachment)
   }

   array(itemType: IType): ListValue {
      return new ListValue(itemType, this.attachment)
   }
}