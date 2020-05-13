import { INamespace } from "../Namespace";
import { IProjectContext } from "../Project";
import { IOrchestrator } from "../Orchestrator";
import { IRequestForChangeSource } from "../actions";
import { IQualifiedObjectCollection, QualifiedObjectCollection } from "./QualifiedObjectCollection";
import { QualifiedObjectType } from "../utils";

export interface INamespaceCollection extends IQualifiedObjectCollection<INamespace> {
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

   get orchestrator(): IOrchestrator {
      return this.context.orchestrator
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