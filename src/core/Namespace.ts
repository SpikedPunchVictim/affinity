import { QualifiedObject } from './QualifiedObject'

import { 
   IQualifiedObject,
   IProjectContext } from '.'

import { 
   IInstanceCollection,
   IModelCollection,
   InstanceCollection,
   ModelCollection,
   NamespaceCollection,
   INamespaceCollection } from './collections'
import { NamespaceRenameAction } from './actions'

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

   protected onRename(newName: string): Promise<void> {
      let rfc = this.rfc.create(new NamespaceRenameAction(this, this.name, newName))

      return rfc
         .fulfill(action => this._name = newName)
         .commit()
   }
}