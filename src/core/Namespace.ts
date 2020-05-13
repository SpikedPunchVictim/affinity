import { IQualifiedObject, QualifiedObject } from './QualifiedObject'
import { IProjectContext } from './Project'
import { INamedObject } from './NamedObject'

import { 
   IInstanceCollection,
   IModelCollection,
   InstanceCollection,
   ModelCollection,
   NamespaceCollection,
   INamespaceCollection } from './collections'
   
import { EventEmitter } from 'events'

export interface INamespace extends IQualifiedObject {
   readonly children: INamespaceCollection
   readonly models: IModelCollection
   readonly instances: IInstanceCollection
}

export class Namespace extends QualifiedObject {
   readonly children: INamespaceCollection
   readonly models: IModelCollection
   readonly instances: IInstanceCollection

   constructor(id: string, parent: INamespace, name: string, context: IProjectContext) {
      super(id, parent, name, context)
      this.children = new NamespaceCollection(this, context)
      this.models = new ModelCollection(this, context)
      this.instances = new InstanceCollection(this, context)
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

   constructor(id: string, context: IProjectContext) {
      super()
      this.id = id
      this.context = context
      this.children = new NamespaceCollection(this, context)
      this.models = new ModelCollection(this, this.context)
      this.instances = new InstanceCollection(this, this.context)
   }

   move(to: INamespace): Promise<IQualifiedObject> {
      throw new Error(`Cannot move the Root Namespace`)
   }

   rename(name: string): Promise<INamedObject> {
      throw new Error(`Cannot rename the Root Namespace`)
   }

   merge(other: IQualifiedObject): void {
      throw new Error(`Root is static an cannot be merged`)
   }
}
