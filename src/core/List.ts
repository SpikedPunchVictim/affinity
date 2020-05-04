import { IQualifiedObject } from "./QualifiedObject";
import { IValue } from "./values/Value";

type ListVisitHandler = (value: IValue)=> void
type ListPredicateHandler = (value: IValue)=> boolean

export interface IList extends IQualifiedObject {
   readonly length: number
   [Symbol.iterator](): Iterator<IValue>
   at(index: number): IValue | undefined
   forEach(visit: ListVisitHandler): void
   map(visit: ListVisitHandler): void[]
   indexOf(item: IValue): number | undefined
   contains(item: IValue): boolean
   find(visit: ListVisitHandler): IValue | undefined
   filter(visit: ListVisitHandler): Array<IValue>
   insert(index: number, item: IValue): Promise<boolean>
   add(args: IValue | IValue[]): Promise<boolean>
   reorder(from: number, to: number): Promise<boolean>
   clear(): Promise<boolean>
   remove(items: IValue | IValue[]): Promise<boolean>
   removeAt(index: number): Promise<boolean>
   removeAll(filter: ListPredicateHandler): Promise<boolean>
}