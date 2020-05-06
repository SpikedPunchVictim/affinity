import { INamespace } from "../Namespace";
import { IProjectContext } from "../Project";
import { NamedCollection, INamedCollection } from "./NamedCollection";
import { IOrchestrator } from "../Orchestrator";
import { IRequestForChangeSource } from "../actions";
import { ItemRemove } from "./ObservableCollection";

export interface INamespaceCollection extends INamedCollection<INamespace> {
   create(name: string): Promise<INamespace>
}

export class NamespaceCollection 
   extends NamedCollection<INamespace>
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
      super()
      this.parent = parent
      this.context = context
   }

   async create(name: string): Promise<INamespace> {
      return await this.orchestrator.createNamespace(this.parent, name)
   }

   async _remove(items: Array<ItemRemove<INamespace>>): Promise<boolean> {
      return await this.orchestrator.delete(items.map(it => it.item))
   }
}