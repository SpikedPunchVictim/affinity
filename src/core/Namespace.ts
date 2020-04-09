import { IQualifiedObject, QualifiedObject } from './QualifiedObject'
import { NamespaceCollection, INamespaceCollection } from './collections'
import { IProjectContext } from './Project'

export interface INamespace extends IQualifiedObject {
   readonly children: INamespaceCollection
   // readonly models: IModelCollection
   // readonly instances: IInstanceCollection
}

export class Namespace extends QualifiedObject {
   readonly children: INamespaceCollection
   // readonly models: IModelCollection
   // readonly instances: IInstanceCollection

   constructor(parent: INamespace, name: string, context: IProjectContext) {
      super(parent, name)
      this.children = new NamespaceCollection(this, context)
   }
}