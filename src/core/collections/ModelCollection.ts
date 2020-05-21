import { IProjectContext } from "../Project";
import { IModel } from "../Model";
import { INamespace } from '../Namespace'
import { QualifiedObjectCollection, IQualifiedObjectCollection } from "./QualifiedObjectCollection";
import { QualifiedObjectType } from "../utils";
import { IObservableCollection } from "./ObservableCollection";

export interface IModelCollection extends IQualifiedObjectCollection<IModel> {
   readonly observable: IObservableCollection<IModel>
   create(name: string): Promise<IModel>
}

export class ModelCollection 
   extends QualifiedObjectCollection<IModel>
   implements IModelCollection {
   
   readonly parent: INamespace
   readonly context: IProjectContext
   
   constructor(parent: INamespace, context: IProjectContext) {
      super(QualifiedObjectType.Model, parent, context.orchestrator)
      this.parent = parent
      this.context = context
   }

   async create(name: string): Promise<IModel> {
      return await this.orchestrator.createModel(this.parent, name)
   }
}