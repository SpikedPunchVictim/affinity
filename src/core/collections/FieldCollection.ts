import { IField } from '../Field'
import { IInstance } from '../Instance'
import { IProjectContext } from '../Project'
import { IOrchestrator } from '../orchestrator/Orchestrator';
import { IObservableCollection, ObservableCollection, VisitHandler } from "./ObservableCollection";
import { IAsyncReadableCollection } from "./Async";
import { EventEmitter } from 'events';

export interface IFieldCollection extends IAsyncReadableCollection<IField>, EventEmitter {
   readonly instance: IInstance
   readonly observable: IObservableCollection<IField>
   //sync(model: IModel): Promise<void>
}

export class FieldCollection 
   extends EventEmitter
   implements IFieldCollection {

   readonly instance: IInstance
   readonly context: IProjectContext

   private items: ObservableCollection<IField>


   get length(): number {
      return this.items.length
   }

   get observable(): IObservableCollection<IField> {
      return this.items
   }

   get orchestrator(): IOrchestrator {
      return this.context.orchestrator
   }

   constructor(instance: IInstance, context: IProjectContext) {
      super()
      this.instance = instance
      this.context = context
      this.items = new ObservableCollection<IField>()
   }

   async at(index: number): Promise<IField> {
      await this.orchestrator.updateFields(this.instance)
      return this.items.at(index)
   }

   async contains(item: IField): Promise<boolean> {
      await this.orchestrator.updateFields(this.instance)
      return this.items.find(m => m.id === item.id) !== undefined
   }

   //exists(name: string): Promise<boolean> // Add one day
   async filter(visit: VisitHandler<IField>): Promise<Array<IField>> {
      await this.orchestrator.updateFields(this.instance)
      return this.items.filter(visit)
   }

   async find(visit: VisitHandler<IField>): Promise<IField | undefined> {
      await this.orchestrator.updateFields(this.instance)
      return this.items.find(visit)
   }

   async findIndex(visit: VisitHandler<IField>): Promise<number> {
      await this.orchestrator.updateFields(this.instance)
      return this.items.findIndex(visit)
   }

   async forEach(visit: VisitHandler<IField>): Promise<void> {
      await this.orchestrator.updateFields(this.instance)
      return this.items.forEach(visit)
   }

   async get(name: string): Promise<IField | undefined> {
      await this.orchestrator.updateFields(this.instance)
      return this.items.find(m => m.name.toLowerCase() === name.toLowerCase())
   }

   async indexOf(item: IField): Promise<number | undefined> {
      await this.orchestrator.updateFields(this.instance)
      return this.items.indexOf(item)
   }

   async map(visit: VisitHandler<IField>): Promise<void[]> {
      await this.orchestrator.updateFields(this.instance)
      return this.items.map(visit)
   }

   toArray(): IField[] {
      return this.items.toArray()
   }

   async next(): Promise<IteratorResult<IField>> {
      await this.orchestrator.updateFields(this.instance)

      let self = this
      let index = 0

      return index == self.items.length ?
         { value: undefined, done: true } :
         { value: self.items[index++], done: false }
   }

   [Symbol.asyncIterator](): AsyncIterator<IField> {
      return this
   }
}