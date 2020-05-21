import { INamespace } from "../Namespace";
import { IProjectContext } from "../Project";
import { IRequestForChangeSource } from "../actions";
import { IQualifiedObjectCollection, QualifiedObjectCollection } from "./QualifiedObjectCollection";
import { QualifiedObjectType } from "../utils";
import { IObservableCollection } from "./ObservableCollection";

export interface INamespaceCollection extends IQualifiedObjectCollection<INamespace> {
   readonly observable: IObservableCollection<INamespace>
   create(name: string): Promise<INamespace>
}

export class NamespaceCollection 
   extends QualifiedObjectCollection<INamespace>
   implements INamespaceCollection {
   
   readonly parent: INamespace
   readonly context: IProjectContext

   get rfc(): IRequestForChangeSource {
      return this.context.rfc
   }

   constructor(parent: INamespace, context: IProjectContext) {
      super(QualifiedObjectType.Namespace, parent, context.orchestrator)
      this.parent = parent
      this.context = context
   }

   async create(name: string): Promise<INamespace> {
      return await this.orchestrator.createNamespace(this.parent, name)
   }
}