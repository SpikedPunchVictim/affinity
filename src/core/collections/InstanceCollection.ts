import { IInstance} from '../Instance'
import { INamespace } from '../Namespace'
import { IProjectContext } from '../Project'
import { IModel } from '../Model'
import { IOrchestrator } from "../Orchestrator"
import { IQualifiedObjectCollection, QualifiedObjectCollection } from "./QualifiedObjectCollection"
import { QualifiedObjectType } from "../utils"

export interface IInstanceCollection extends IQualifiedObjectCollection<IInstance> {
   create(name: string, model: IModel): Promise<IInstance>
}

export class InstanceCollection 
   extends QualifiedObjectCollection<IInstance>
   implements IInstanceCollection {
   
   readonly parent: INamespace
   readonly context: IProjectContext

   get orchestrator(): IOrchestrator {
      return this.context.orchestrator
   }
   
   constructor(parent: INamespace, context: IProjectContext) {
      super(QualifiedObjectType.Instance, parent, context.orchestrator)
      this.parent = parent
      this.context = context
   }

   async create(name: string, model: IModel): Promise<IInstance> {
      return this.orchestrator.createInstance(this.parent, model, name)
   }
}