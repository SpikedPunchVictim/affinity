import { 
   IInstance,
   INamespace,
   IProjectContext, 
   IModel } from ".."

import { NamedCollection, INamedCollection } from './NamedCollection'
import { IRequestForChangeSource } from "../actions"
import { IOrchestrator } from "../Orchestrator"

export interface IInstanceCollection extends INamedCollection<IInstance> {
   create(name: string, model: IModel): Promise<IInstance>
}

export class InstanceCollection 
   extends NamedCollection<IInstance>
   implements IInstanceCollection {
   
   readonly parent: INamespace
   readonly context: IProjectContext

   get orchestrator(): IOrchestrator {
      return this.context.orchestrator
   }
   
   constructor(parent: INamespace, context: IProjectContext) {
      super()
      this.parent = parent
      this.context = context
   }

   async create(name: string, model: IModel): Promise<IInstance> {
      return this.orchestrator.createInstance(this.parent, model, name)
   }
}