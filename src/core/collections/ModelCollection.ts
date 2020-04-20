import { IProjectContext } from "../Project";
import { IModel, Model } from "../Model";
import { INamespace } from '../Namespace'
import { NamedCollection, INamedCollection } from "./NamedCollection";
import { IRequestForChangeSource, ModelCreateAction } from "../actions";
import { IOrchestrator } from "../Orchestrator";

export interface IModelCollection extends INamedCollection<IModel> {
   create(name: string): Promise<IModel>
}

export class ModelCollection 
   extends NamedCollection<IModel>
   implements IModelCollection {
   
   readonly parent: INamespace
   readonly context: IProjectContext

   private get rfc(): IRequestForChangeSource {
      return this.context.rfc
   }

   get orchestrator(): IOrchestrator {
      return this.context.orchestrator
   }
   
   constructor(parent: INamespace, context: IProjectContext) {
      super()
      this.parent = parent
      this.context = context
   }

   async create(name: string): Promise<IModel> {
      return await this.orchestrator.createModel(this.parent, name)
   }
}