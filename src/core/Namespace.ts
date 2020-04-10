import { 
   IQualifiedObject,
   IProjectContext,
   QualifiedObject } from '.'

import { 
   IInstanceCollection,
   IModelCollection,
   InstanceCollection,
   ModelCollection,
   NamespaceCollection,
   INamespaceCollection } from './collections'

export interface INamespace extends IQualifiedObject {
   readonly children: INamespaceCollection
   readonly models: IModelCollection
   readonly instances: IInstanceCollection
}

export class Namespace extends QualifiedObject {
   readonly children: INamespaceCollection
   readonly models: IModelCollection
   readonly context: IProjectContext
   readonly instances: IInstanceCollection

   constructor(parent: INamespace, name: string, context: IProjectContext) {
      super(parent, name)
      this.context = context
      this.children = new NamespaceCollection(this, this.context)
      this.models = new ModelCollection(this, this.context)
      this.instances = new InstanceCollection(this, this.context)
   }
}