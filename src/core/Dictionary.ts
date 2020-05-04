import { IQualifiedObject } from "./QualifiedObject";
import { IValue } from "./values/Value";

export interface IDictionary  extends IQualifiedObject {
   keyType: IValue
   valueType: IValue
   readonly size: number
   readonly keys: Iterator<IValue>
   readonly values: Iterator<IValue>
   add(key: IValue, value: IValue): Promise<boolean>
   remove(key: IValue): Promise<boolean>
   clear(): Promise<boolean>
   containsKey(key: IValue): boolean
}