import { IQualifiedObject } from "../QualifiedObject"
import { INamespace } from "../Namespace"
import { QualifiedObjectType, as } from "../utils/Types"
import { IOrchestrator } from "../Orchestrator"
import { NamedCollection } from "./NamedCollection"
import { IndexableItem } from "./ChangeSets"
import { sortByIndexReverse, VisitHandler, PredicateHandler } from "./ObservableCollection"
import { ArgumentError } from "../../errors/ArgumentError"

export interface IQualifiedObjectCollection<T extends IQualifiedObject> {
   [Symbol.asyncIterator](): AsyncIterator<T>
   at(index: number): Promise<T | undefined>
   clear(): Promise<boolean>
   contains(item: T): Promise<boolean>
   delete(name: string): Promise<boolean>
   filter(visit: VisitHandler<T>): Promise<Array<T>>
   find(visit: VisitHandler<T>): Promise<T | undefined>
   forEach(visit: VisitHandler<T>): Promise<void>
   get(name: string): Promise<T | undefined>
   indexOf(item: T): Promise<number | undefined>
   map(visit: VisitHandler<T>): Promise<void[]>
   move(from: number, to: number): Promise<boolean>
   remove(items: T | T[]): Promise<boolean>
   removeAt(index: number): Promise<boolean>
   removeAll(filter: PredicateHandler<T>): Promise<boolean>
   toArray(): T[]
}

export class QualifiedObjectCollection<T extends IQualifiedObject>
   implements IQualifiedObjectCollection<T> {
   readonly type: QualifiedObjectType
   readonly parent: INamespace
   readonly orchestrator: IOrchestrator

   readonly items: NamedCollection<T>

   constructor(type: QualifiedObjectType, parent: INamespace, orchestrator: IOrchestrator) {
      this.type = type
      this.parent = parent
      this.orchestrator = orchestrator
      this.items = new NamedCollection<T>()
   }

   static of<T extends IQualifiedObject>(collection: IQualifiedObjectCollection<T>): QualifiedObjectCollection<T> {
      return collection as QualifiedObjectCollection<T>
   }

   merge(items: Array<IndexableItem<IQualifiedObject>>): void {
      // Sort them from highest index to lowest. This allows
      // us to add the entries without affecting the item's
      // intended index in this collection
      items.sort(sortByIndexReverse)

      for (let item of items) {
         let found = this.getById(item.item.id)

         if (!found) {
            this.items.insert(item.index, as<T>(item.item))
         } else {
            found.merge(item.item)
         }
      }
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
      let items = await this.orchestrator.getQualifiedObjects(this.type, this.parent, undefined)

      if (items === undefined) {
         return { value: undefined, done: true }
      }

      this.merge(items)

      let self = this
      let index = 0

      return index == self.items.length ?
         { value: undefined, done: true } :
         { value: self.items[index++], done: false }
   }

   [Symbol.asyncIterator](): AsyncIterator<T> {
      return this
   }

   async at(index: number): Promise<T | undefined> {
      let items = await this.orchestrator.getQualifiedObjects(this.type, this.parent, [index])

      if (items === undefined) {
         return undefined
      }

      this.merge(items)
      return this.items.at(index)
   }

   async clear(): Promise<boolean> {
      return this.orchestrator.delete(this.items.toArray())
   }

   async contains(item: T): Promise<boolean> {
      return this.indexOf(item) !== undefined
   }

   async delete(name: string): Promise<boolean> {
      let items = await this.orchestrator.getQualifiedObjects(this.type, this.parent, undefined)

      if (items === undefined) {
         return false
      }

      this.merge(items)

      let found = this.items.find(item => item.name === name)

      return found === undefined ? false : this.orchestrator.delete(found)
   }


   async forEach(visit: VisitHandler<T>): Promise<void> {
      let items = await this.orchestrator.getQualifiedObjects(this.type, this.parent, undefined)

      if (items === undefined) {
         return
      }

      this.merge(items)

      this.items.forEach(visit)
      return
   }

   async filter(visit: VisitHandler<T>): Promise<Array<T>> {
      let items = await this.orchestrator.getQualifiedObjects(this.type, this.parent, undefined)

      if (items === undefined) {
         return []
      }

      this.merge(items)

      return this.items.filter(visit)
   }

   async find(visit: VisitHandler<T>): Promise<T | undefined> {
      let items = await this.orchestrator.getQualifiedObjects(this.type, this.parent, undefined)

      if (items === undefined) {
         return undefined
      }

      this.merge(items)

      return this.items.find(visit)
   }

   async get(name: string): Promise<T | undefined> {
      let items = await this.orchestrator.getQualifiedObjects(this.type, this.parent, undefined)

      if (items === undefined) {
         return
      }

      this.merge(items)

      return this.items.find(item => item.name === name)
   }

   async indexOf(item: T): Promise<number | undefined> {
      let items = await this.orchestrator.getQualifiedObjects(this.type, this.parent, undefined)

      if (items === undefined) {
         return undefined
      }

      let found = this.getById(item.id)

      // Should this happen? Throw Error instead?
      if (found === undefined) {
         return undefined
      }

      return this.items.indexOf(found)
   }

   async map(visit: VisitHandler<T>): Promise<void[]> {
      let items = await this.orchestrator.getQualifiedObjects(this.type, this.parent, undefined)

      if (items === undefined) {
         return []
      }

      this.merge(items)

      return this.items.map(visit)
   }

   async move(from: number, to: number): Promise<boolean> {
      await this.orchestrator.reorder(this.items[from], from, to)
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
      let items = await this.orchestrator.getQualifiedObjects(this.type, this.parent, undefined)

      if (items === undefined) {
         return false
      }

      this.merge(items)

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