import { IField } from '../Field'
import { IInstance } from '../Instance'
import { IProjectContext } from '../Project'
import { IOrchestrator } from '../Orchestrator';
import { IObservableCollection, ObservableCollection, VisitHandler } from "./ObservableCollection";
import { IAsyncReadableCollection } from "./Async";
import { EventEmitter } from 'events';
import { IndexableItem } from './ChangeSets';

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
      let fields = await this.orchestrator.getFields(this.instance)
      this.merge(fields)
      return this.items.at(index)
   }

   async contains(item: IField): Promise<boolean> {
      let fields = await this.orchestrator.getFields(this.instance)
      this.merge(fields)
      return this.items.find(m => m.id === item.id) !== undefined
   }

   //exists(name: string): Promise<boolean> // Add one day
   async filter(visit: VisitHandler<IField>): Promise<Array<IField>> {
      let fields = await this.orchestrator.getFields(this.instance)
      this.merge(fields)
      return this.items.filter(visit)
   }

   async find(visit: VisitHandler<IField>): Promise<IField | undefined> {
      let fields = await this.orchestrator.getFields(this.instance)
      this.merge(fields)
      return this.items.find(visit)
   }

   async forEach(visit: VisitHandler<IField>): Promise<void> {
      let fields = await this.orchestrator.getFields(this.instance)
      this.merge(fields)
      return this.items.forEach(visit)
   }

   async get(name: string): Promise<IField | undefined> {
      let fields = await this.orchestrator.getFields(this.instance)
      this.merge(fields)
      return this.items.find(m => m.name.toLowerCase() === name.toLowerCase())
   }

   async indexOf(item: IField): Promise<number | undefined> {
      let fields = await this.orchestrator.getFields(this.instance)
      this.merge(fields)
      return this.items.indexOf(item)
   }

   async map(visit: VisitHandler<IField>): Promise<void[]> {
      let fields = await this.orchestrator.getFields(this.instance)
      this.merge(fields)
      return this.items.map(visit)
   }

   toArray(): IField[] {
      return this.items.toArray()
   }

   async next(): Promise<IteratorResult<IField>> {
      let fields = await this.orchestrator.getFields(this.instance)

      if (fields === undefined) {
         return { value: undefined, done: true }
      }

      this.merge(fields)

      let self = this
      let index = 0

      return index == self.items.length ?
         { value: undefined, done: true } :
         { value: self.items[index++], done: false }
   }

   [Symbol.asyncIterator](): AsyncIterator<IField> {
      return this
   }

   private merge(members: Array<IndexableItem<IField>>): void {

   }

}