import { VisitHandler, PredicateHandler } from "./ObservableCollection";

export interface IAsyncReadableCollection<T> {
   [Symbol.asyncIterator](): AsyncIterator<T>
   readonly length: number
   at(index: number): Promise<T>
   contains(item: T): Promise<boolean>
   //exists(name: string): Promise<boolean> // Add one day
   filter(visit: VisitHandler<T>): Promise<Array<T>>
   find(visit: VisitHandler<T>): Promise<T | undefined>
   forEach(visit: VisitHandler<T>): Promise<void>
   get(name: string): Promise<T | undefined>
   indexOf(item: T): Promise<number | undefined>
   map(visit: VisitHandler<T>): Promise<void[]>
   toArray(): T[]
}

export interface IAsyncEditableCollection<T> {
   add(...adds: T[]): Promise<boolean>
   insert(item: T, index: number): Promise<boolean>
   clear(): Promise<boolean>
   delete(name: string): Promise<boolean>
   move(from: number, to: number): Promise<boolean>
   remove(items: T | T[]): Promise<boolean>
   removeAt(index: number): Promise<boolean>
   removeAll(filter: PredicateHandler<T>): Promise<boolean>
}

export interface IASyncCollection<T> extends IAsyncReadableCollection<T>, IAsyncEditableCollection<T> {
   
}