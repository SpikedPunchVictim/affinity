import { IProjectContext } from './Project'
import { INamedObject } from './NamedObject'
import { RestoreInfo } from './Restore'

import { IInstanceCollection, InstanceCollection } from './collections/InstanceCollection'
import { IModelCollection, ModelCollection } from './collections/ModelCollection'
import { INamespaceCollection, NamespaceCollection } from './collections/NamespaceCollection'
import { ObservableEvents } from './collections/ObservableCollection'

import { EventEmitter } from 'events'
import { ItemAdd } from './collections/ChangeSets'
import { QualifiedObjectType } from './utils'
import { ModelLazyRestoreInfo } from './Model'
import { InstanceLazyRestoreInfo } from './Instance'
import { IQualifiedObject, QualifiedObject } from './QualifiedObject'

export class NamespaceLazyRestoreInfo extends RestoreInfo {
   constructor(
      name: string = "",
      qualifiedName: string = "",
      id: string = "",
      parentId: string = "",
      index: number = -1) {
      super(name, qualifiedName, id, parentId, index)
   }
}

export class NamespaceFullRestoreInfo extends NamespaceLazyRestoreInfo {
   children: Array<NamespaceLazyRestoreInfo> = new Array<NamespaceLazyRestoreInfo>()
   models: Array<ModelLazyRestoreInfo> = new Array<ModelLazyRestoreInfo>()
   instances: Array<InstanceLazyRestoreInfo> = new Array<InstanceLazyRestoreInfo>()

   constructor(
      name: string = "",
      qualifiedName: string = "",
      id: string = "",
      parentId: string = "",
      index: number = -1) {
      super(name, qualifiedName, id, parentId, index)
   }
}

export interface INamespace extends IQualifiedObject {
   readonly children: INamespaceCollection
   readonly models: IModelCollection
   readonly instances: IInstanceCollection
}

export class Namespace extends QualifiedObject {
   readonly children: INamespaceCollection
   readonly models: IModelCollection
   readonly instances: IInstanceCollection

   constructor(
      name: string,
      parent: INamespace,
      context: IProjectContext,
      id: string
   ) {
      super(name, parent, QualifiedObjectType.Namespace, context, id)
      this.children = new NamespaceCollection(this, context)
      this.models = new ModelCollection(this, context)
      this.instances = new InstanceCollection(this, context)

      this.children.on(ObservableEvents.added, this.onQualifiedObjectAdded.bind(this))
      this.models.on(ObservableEvents.added, this.onQualifiedObjectAdded.bind(this))
      this.instances.on(ObservableEvents.added, this.onQualifiedObjectAdded.bind(this))
   }

   onQualifiedObjectAdded<T extends IQualifiedObject>(change: ItemAdd<T>[]): void {
      change.forEach(ch => {
         //@ts-ignore
         let obj = <QualifiedObject>ch.item
         obj.setParent(this)
      })
   }

   protected async onRename(newName: string): Promise<void> {
      this.orchestrator.rename(this, newName)
   }
}

export class RootNamespace
   extends EventEmitter
   implements INamespace {

   context: IProjectContext
   children: INamespaceCollection
   models: IModelCollection
   instances: IInstanceCollection

   readonly id: string
   readonly name: string = ''
   readonly qualifiedName: string = ''
   readonly parent: INamespace | null = null
   readonly type: QualifiedObjectType = QualifiedObjectType.Namespace

   constructor(id: string, context: IProjectContext) {
      super()
      this.id = id
      this.context = context
      this.children = new NamespaceCollection(this, context)
      this.models = new ModelCollection(this, this.context)
      this.instances = new InstanceCollection(this, this.context)

      this.children.on(ObservableEvents.added, this._onQualifiedObjectAdded.bind(this))
      this.models.on(ObservableEvents.added, this._onQualifiedObjectAdded.bind(this))
      this.instances.on(ObservableEvents.added, this._onQualifiedObjectAdded.bind(this))
   }

   attach(parent: INamespace, context: IProjectContext): void {
      throw new Error(`Cannot attach theRoot Namespace`)
   }

   move(to: INamespace): Promise<IQualifiedObject> {
      throw new Error(`Cannot move the Root Namespace`)
   }

   rename(name: string): Promise<INamedObject> {
      throw new Error(`Cannot rename the Root Namespace`)
   }

   async update(): Promise<void> {
      return this.context.orchestrator.updateQualifiedObject(this)
   }

   _onQualifiedObjectAdded<T extends IQualifiedObject>(changes: ItemAdd<T>[]): void {
      for (let change of changes) {
         change.item.attach(this, this.context)
      }
   }
}

export class OrphanedNamespace implements INamespace {
   readonly type: QualifiedObjectType = QualifiedObjectType.Namespace

   get children(): INamespaceCollection {
      throw new Error(`Orphaned Namespaces have no children`)
   }

   get models(): IModelCollection {
      throw new Error(`Orphaned Namespaces have no Models`)
   }

   get instances(): IInstanceCollection {
      throw new Error(`Orphaned Namespaces have no instances`)
   }

   get id(): string {
      return "@rphaned"
   }

   get qualifiedName(): string {
      return '@rphaned'
   }

   get parent(): INamespace | null {
      return null
   }

   get name(): string {
      return '@rphaned'
   }

   constructor() {

   }

   attach(parent: INamespace, context: IProjectContext): void {
      // TODO: Revisit this. Perhaps create a new Namespace
      throw new Error("Cannot attach orphaned Namespaces")
   }

   move(to: INamespace): Promise<IQualifiedObject> {
      throw new Error("Cannot move orphaned Namespaces.")
   }

   rename(name: string): Promise<INamedObject> {
      throw new Error("Cannot rename orphaned Namespaces")
   }

   update(): Promise<void> {
      throw new Error("Cannot move orphaned Namespaces.")
   }

   addListener(event: string | symbol, listener: (...args: any[]) => void): this {
      throw new Error("Cannot addListener orphaned Namespaces")
   }

   on(event: string | symbol, listener: (...args: any[]) => void): this {
      throw new Error("Cannot listen to events on an orphaned Namespaces")
   }

   once(event: string | symbol, listener: (...args: any[]) => void): this {
      throw new Error("Cannot listen to events on an orphaned Namespaces")
   }

   removeListener(event: string | symbol, listener: (...args: any[]) => void): this {
      throw new Error("Cannot listen to events on an orphaned Namespaces")
   }

   off(event: string | symbol, listener: (...args: any[]) => void): this {
      throw new Error("Cannot listen to events on an orphaned Namespaces")
   }
   removeAllListeners(event?: string | symbol | undefined): this {
      throw new Error("Cannot listen to events on an orphaned Namespaces")
   }
   setMaxListeners(n: number): this {
      throw new Error("Cannot listen to events on an orphaned Namespaces")
   }
   getMaxListeners(): number {
      throw new Error("Cannot listen to events on an orphaned Namespaces")
   }
   listeners(event: string | symbol): Function[] {
      throw new Error("Cannot listen to events on an orphaned Namespaces")
   }
   rawListeners(event: string | symbol): Function[] {
      throw new Error("Cannot listen to events on an orphaned Namespaces")
   }
   emit(event: string | symbol, ...args: any[]): boolean {
      throw new Error("Cannot listen to events on an orphaned Namespaces")
   }
   listenerCount(type: string | symbol): number {
      throw new Error("Cannot listen to events on an orphaned Namespaces")
   }
   prependListener(event: string | symbol, listener: (...args: any[]) => void): this {
      throw new Error("Cannot listen to events on an orphaned Namespaces")
   }
   prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this {
      throw new Error("Cannot listen to events on an orphaned Namespaces")
   }
   eventNames(): (string | symbol)[] {
      throw new Error("Cannot listen to events on an orphaned Namespaces")
   }
}