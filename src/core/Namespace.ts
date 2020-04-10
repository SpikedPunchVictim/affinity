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
   readonly instances: IInstanceCollection

   constructor(parent: INamespace, name: string, context: IProjectContext) {
      super(parent, name, context)
      this.children = new NamespaceCollection(this, context)
      this.models = new ModelCollection(this, context)
      this.instances = new InstanceCollection(this, context)
   }
}