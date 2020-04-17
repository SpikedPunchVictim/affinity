import { QualifiedObject } from './QualifiedObject'

import { 
   IQualifiedObject,
   IProjectContext, 
   IModel,
   IInstance,
   INamedObject} from '.'

import { 
   IInstanceCollection,
   IModelCollection,
   InstanceCollection,
   ModelCollection,
   NamespaceCollection,
   INamespaceCollection } from './collections'
   
import { NamespaceRenameAction } from './actions'
import { Switch, as } from './utils'
import { ArgumentError } from '../errors'

export interface INamespace extends IQualifiedObject {
   readonly children: INamespaceCollection
   readonly models: IModelCollection
   readonly instances: IInstanceCollection
   moveIn(obj: IQualifiedObject): Promise<IQualifiedObject>
   moveOut(obj: IQualifiedObject): Promise<IQualifiedObject>
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
         .fulfill(action => {
            this._name = newName
            return Promise.resolve()
         })
         .commit()
   }

   moveIn(obj: IQualifiedObject): Promise<IQualifiedObject> {
      return moveIn(this, obj)
   }

   moveOut(obj: IQualifiedObject): Promise<IQualifiedObject> {
      return moveOut(this, obj)
   }
}


export class RootNamespace implements INamespace {
   context: IProjectContext
   children: INamespaceCollection
   models: IModelCollection
   instances: IInstanceCollection

   readonly name: string = ''
   readonly qualifiedName: string = ''
   readonly parent: INamespace | null = null

   constructor(context: IProjectContext) {
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

   moveIn(obj: IQualifiedObject): Promise<IQualifiedObject> {
      return moveIn(this, obj)
   }

   moveOut(obj: IQualifiedObject): Promise<IQualifiedObject> {
      return moveOut(this, obj)
   }
}

async function moveOut(from: INamespace, obj: IQualifiedObject): Promise<IQualifiedObject> {
   if(obj == null) {
      throw new ArgumentError(`obj must be valid when moving between Namespaces`)
   }

   await Switch.case(obj, {
      Namespace: async (it) => await from.children.moveOut(as<INamespace>(it)),
      Model: async (it) => await from.models.moveOut(as<IModel>(it)),
      Instance: async (it) => await from.instances.moveOut(as<IInstance>(it))
   })

   return obj
}

async function moveIn(to: INamespace, obj: IQualifiedObject): Promise<IQualifiedObject> {
   if(obj == null) {
      throw new ArgumentError(`obj must be valid when moving between Namespaces`)
   }

   await Switch.case(obj, {
      Namespace: async (it) => to.children.moveIn(as<INamespace>(it)),
      Model: async (it) => to.models.moveIn(as<IModel>(it)),
      Instance: async (it) => to.instances.moveIn(as<IInstance>(it))
   })

   let target = as<QualifiedObject>(obj)
   target.setParent(as<INamespace>(to))
   return obj
}
