import { IQualifiedObject } from "../QualifiedObject"
import { INamespace } from "../Namespace"
import { QualifiedObjectType } from "../utils/Types"
import { IOrchestrator } from "../orchestrator/Orchestrator"
import { NamedCollection } from "./NamedCollection"
import { VisitHandler, PredicateHandler, IObservableCollection } from "./ObservableCollection"
import { ArgumentError } from "../../errors/ArgumentError"
import { EventEmitter } from 'events'
import { IAsyncReadableCollection } from "./Async"

export interface IQualifiedObjectCollection<T extends IQualifiedObject>
   extends EventEmitter, IAsyncReadableCollection<T> {
   readonly observable: IObservableCollection<T>
   clear(): Promise<boolean>
   delete(name: string): Promise<boolean>
   move(from: number, to: number): Promise<boolean>
   remove(items: T | T[]): Promise<boolean>
   removeAt(index: number): Promise<boolean>
   removeAll(filter: PredicateHandler<T>): Promise<boolean>
}

export class QualifiedObjectCollection<T extends IQualifiedObject>
   extends EventEmitter
   implements IQualifiedObjectCollection<T> {

   readonly type: QualifiedObjectType
   readonly parent: INamespace
   readonly orchestrator: IOrchestrator

   readonly items: NamedCollection<T>

   get length(): number {
      return this.items.length
   }

   get observable(): IObservableCollection<T> {
      return this.items
   }

   constructor(type: QualifiedObjectType, parent: INamespace, orchestrator: IOrchestrator) {
      super()
      this.type = type
      this.parent = parent
      this.orchestrator = orchestrator
      this.items = new NamedCollection<T>()
   }

   static of<T extends IQualifiedObject>(collection: IQualifiedObjectCollection<T>): QualifiedObjectCollection<T> {
      return collection as QualifiedObjectCollection<T>
   }

   getById(id: string): T | undefined {
      for (let item of this.items) {
         if (item.id === id) {
            return item
         }
      }

      return undefined
   }

   async next(): Promise<IteratorResult<T>> {
      await this.orchestrator.updateQualifiedObjects(this.type, this.parent)

      let self = this
      let index = 0

      return index == self.items.length ?
         { value: undefined, done: true } :
         { value: self.items[index++], done: false }
   }

   [Symbol.asyncIterator](): AsyncIterator<T> {
      return this
   }

   async at(index: number): Promise<T> {
      await this.orchestrator.updateQualifiedObjects(this.type, this.parent)
      return this.items.at(index)
   }

   async clear(): Promise<boolean> {
      return this.orchestrator.delete(this.items.toArray())
   }

   async contains(item: T): Promise<boolean> {
      return this.indexOf(item) !== undefined
   }

   async delete(name: string): Promise<boolean> {
      await this.orchestrator.updateQualifiedObjects(this.type, this.parent)

      let found = this.items.find(item => item.name === name)

      return found === undefined ? false : this.orchestrator.delete(found)
   }

   async forEach(visit: VisitHandler<T>): Promise<void> {
      await this.orchestrator.updateQualifiedObjects(this.type, this.parent)
      this.items.forEach(visit)
      return
   }

   async filter(visit: VisitHandler<T>): Promise<Array<T>> {
      await this.orchestrator.updateQualifiedObjects(this.type, this.parent)
      return this.items.filter(visit)
   }

   async find(visit: VisitHandler<T>): Promise<T | undefined> {
      await this.orchestrator.updateQualifiedObjects(this.type, this.parent)
      return this.items.find(visit)
   }

   async findIndex(visit: VisitHandler<T>): Promise<number> {
      await this.orchestrator.updateQualifiedObjects(this.type, this.parent)
      return this.items.findIndex(visit)
   }

   async get(name: string): Promise<T | undefined> {
      await this.orchestrator.updateQualifiedObjects(this.type, this.parent)
      return this.items.find(item => item.name === name)
   }

   async indexOf(item: T): Promise<number | undefined> {
      await this.orchestrator.updateQualifiedObjects(this.type, this.parent)

      let found = this.getById(item.id)

      // Should this happen? Throw Error instead?
      if (found === undefined) {
         return undefined
      }

      return this.items.indexOf(found)
   }

   async map(visit: VisitHandler<T>): Promise<void[]> {
      await this.orchestrator.updateQualifiedObjects(this.type, this.parent)
      return this.items.map(visit)
   }

   async move(from: number, to: number): Promise<boolean> {
      await this.orchestrator.reorder(this.items.at(from), from, to)
      return true
   }

   remove(items: T | T[]): Promise<boolean> {
      return this.orchestrator.delete(items)
   }

   removeAt(index: number): Promise<boolean> {
      let found = this.items.at(index)

      if (found === undefined) {
         throw new ArgumentError(`The index provided is out of bounds`)
      }

      return this.orchestrator.delete(found)
   }

   async removeAll(filter: PredicateHandler<T>): Promise<boolean> {
      await this.orchestrator.updateQualifiedObjects(this.type, this.parent)

      let toRemove = new Array<T>()

      for (let i = 0; i < this.items.length; ++i) {
         if (filter(this.items[i], i, this.items.toArray())) {
            toRemove.push(this.items[i])
         }
      }

      return this.orchestrator.delete(toRemove)
   }

   toArray(): T[] {
      return this.items.toArray()
   }
}