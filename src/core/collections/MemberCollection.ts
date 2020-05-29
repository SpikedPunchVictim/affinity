import { IMember, MemberCreateInfo, MemberAdd } from '../Member'
import { IModel } from '../Model'
import { IProjectContext } from '../Project'
import { IOrchestrator } from '../orchestrator/Orchestrator'
import { IAsyncReadableCollection } from './Async'
import { ObservableCollection, VisitHandler, IObservableCollection } from './ObservableCollection'
import { IndexableItem } from './ChangeSets'
import { EventEmitter } from 'events'
import { IValueFactory } from '../values/ValueFactory'
import { Value } from '../values/Value'


export interface IMemberCollection extends IAsyncReadableCollection<IMember>, EventEmitter {
   readonly model: IModel
   readonly observable: IObservableCollection<IMember>
   
   /**
    * Adds Members to this collection
    * 
    * @param params The new Members to add to this collection
    */
   add(...params: Array<MemberCreateInfo>): Promise<IndexableItem<IMember>[]>

   /**
    * Appends Members to the end of this collection
    * 
    * @param params The members to append to the end of this collection
    */
   append(params: MemberAdd): Promise<IndexableItem<IMember>[]>

   /**
    * Deletes all Members from this collection
    */
   clear(): Promise<boolean>

   /**
    * Removes a Member from the Model
    * @param name The name of the Member to remove
    */
   remove(name: string): Promise<boolean>

   /**
    * Removes a Member, by index, from the Model
    * @param index The index of the Member to remove
    */
   removeAt(index: number): Promise<boolean>
}

/**
 * This class is intended to be Asynchronous, relying on the
 * plugins to populate and update it.
 */
export class MemberCollection extends EventEmitter implements IMemberCollection {
   readonly model: IModel
   readonly context: IProjectContext

   private items: ObservableCollection<IMember>

   get length(): number {
      return this.items.length
   }

   get orchestrator(): IOrchestrator {
      return this.context.orchestrator
   }

   get observable(): IObservableCollection<IMember> {
      return this.items
   }

   get valueFactory(): IValueFactory {
      return this.context.valueFactory
   }

   constructor(model: IModel, context: IProjectContext) {
      super()
      this.model = model
      this.context = context
      this.items = new ObservableCollection<IMember>()
   }

   async next(): Promise<IteratorResult<IMember>> {
      await this.orchestrator.updateMembers(this.model)

      let self = this
      let index = 0

      return index == self.items.length ?
         { value: undefined, done: true } :
         { value: self.items[index++], done: false }
   }

   [Symbol.asyncIterator](): AsyncIterator<IMember> {
      return this
   }

   async add(...params: Array<MemberCreateInfo>): Promise<IndexableItem<IMember>[]> {
      await this.orchestrator.updateMembers(this.model)
      return this.orchestrator.createMembers(this.model, params)
   }

   async at(index: number): Promise<IMember> {
      await this.orchestrator.updateMembers(this.model)
      return this.items.at(index)
   }

   async append(params: MemberAdd): Promise<IndexableItem<IMember>[]> {
      await this.orchestrator.updateMembers(this.model)

      // TODO: Validate Member names
      let startIndex = this.items.length

      let items: MemberCreateInfo[] = Object.keys(params)
         .map(k => {
            return {
               name: k,
               value: params[k] instanceof Value ? params[k] : this.valueFactory.from(params[k]),
               index: startIndex++,
               id: ""
            }
         })

      return this.orchestrator.createMembers(this.model, items)
   }

   async clear(): Promise<boolean> {
      await this.orchestrator.updateMembers(this.model)
      let names = this.items.map(m => m.name)
      //@ts-ignore
      await this.orchestrator.deleteMembers(this.model, names)
      return true
   }

   async contains(item: IMember): Promise<boolean> {
      await this.orchestrator.updateMembers(this.model)
      return this.items.find(m => m.name.toLowerCase() === item.name.toLowerCase()) !== undefined
   }

   async create(params: MemberCreateInfo | Array<MemberCreateInfo>): Promise<IndexableItem<IMember>[]> {
      await this.orchestrator.updateMembers(this.model)
      return this.orchestrator.createMembers(this.model, params)
   }

   //exists(name: string): Promise<boolean> // Add one day
   async filter(visit: VisitHandler<IMember>): Promise<Array<IMember>> {
      await this.orchestrator.updateMembers(this.model)
      return this.items.filter(visit)
   }

   async find(visit: VisitHandler<IMember>): Promise<IMember | undefined> {
      await this.orchestrator.updateMembers(this.model)
      return this.items.find(visit)
   }

   async findIndex(visit: VisitHandler<IMember>): Promise<number> {
      await this.orchestrator.updateMembers(this.model)
      return this.items.findIndex(visit)
   }

   async forEach(visit: VisitHandler<IMember>): Promise<void> {
      await this.orchestrator.updateMembers(this.model)
      return this.items.forEach(visit)
   }

   async get(name: string): Promise<IMember | undefined> {
      await this.orchestrator.updateMembers(this.model)
      return this.items.find(m => m.name.toLowerCase() === name.toLowerCase())
   }

   async indexOf(item: IMember): Promise<number | undefined> {
      await this.orchestrator.updateMembers(this.model)
      return this.items.indexOf(item)
   }

   async map(visit: VisitHandler<IMember>): Promise<void[]> {
      await this.orchestrator.updateMembers(this.model)
      return this.items.map(visit)
   }

   async move(from: number, to: number): Promise<boolean> {
      await this.orchestrator.updateMembers(this.model)
      await this.orchestrator.reorderMember(this.model, from, to)
      return true
   }

   async remove(name: string): Promise<boolean> {
      await this.orchestrator.updateMembers(this.model)
      let removed = await this.orchestrator.deleteMembers(this.model, [name])
      return removed.length > 0
   }

   async removeAt(index: number): Promise<boolean> {
      await this.orchestrator.updateMembers(this.model)
      let member = this.items.at(index)
      let removed = await this.orchestrator.deleteMembers(this.model, [member.name])
      return removed.length > 0
   }
   
   toArray(): IMember[] {
      return this.items.toArray()
   }
}