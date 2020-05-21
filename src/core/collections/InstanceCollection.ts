import { IInstance} from '../Instance'
import { INamespace } from '../Namespace'
import { IProjectContext } from '../Project'
import { IModel } from '../Model'
import { IQualifiedObjectCollection, QualifiedObjectCollection } from "./QualifiedObjectCollection"
import { QualifiedObjectType } from "../utils"
import { IObservableCollection } from './ObservableCollection'

export interface IInstanceCollection extends IQualifiedObjectCollection<IInstance> {
   readonly observable: IObservableCollection<IInstance>
   create(name: string, model: IModel): Promise<IInstance>
}

export class InstanceCollection 
   extends QualifiedObjectCollection<IInstance>
   implements IInstanceCollection {
   
   readonly parent: INamespace
   readonly context: IProjectContext
   
   constructor(parent: INamespace, context: IProjectContext) {
      super(QualifiedObjectType.Instance, parent, context.orchestrator)
      this.parent = parent
      this.context = context
   }

   async create(name: string, model: IModel): Promise<IInstance> {
      return this.orchestrator.createInstance(this.parent, model, name)
   }
}