import { ObservableCollection } from "./ObservableCollection";
import { INamespace, Namespace } from "../Namespace";
import { IProjectContext } from "../Project";

export interface INamespaceCollection {
   create(name: string): Promise<INamespace>
   get(name: string): INamespace | undefined
}

export class NamespaceCollection 
   extends ObservableCollection<INamespace>
   implements INamespaceCollection {
   
   readonly parent: INamespace
   readonly context: IProjectContext
   
   constructor(parent: INamespace, context: IProjectContext) {
      super()
      this.parent = parent
      this.context = context
   }

   create(name: string): Promise<INamespace> {
      let namespace = new Namespace(this.parent, name, this.context)
      return Promise.resolve(namespace)
   }

   get(name: string): INamespace | undefined {
      for(let namespace of super.items) {
         if(namespace.name.toLowerCase() === name.toLowerCase()) {
            return namespace
         }
      }

      return undefined
   }
}