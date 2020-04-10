import { ObservableCollection } from "./ObservableCollection";
import { IProjectContext } from "../Project";
import { IModel, Model } from "../Model";
import { INamespace } from '../Namespace'

export interface IModelCollection {
   create(name: string): Promise<IModel>
   get(name: string): IModel | undefined
   delete(name: string): Promise<void>
}

export class ModelCollection 
   extends ObservableCollection<IModel>
   implements IModelCollection {
   
   readonly parent: INamespace
   readonly context: IProjectContext
   
   constructor(parent: INamespace, context: IProjectContext) {
      super()
      this.parent = parent
      this.context = context
   }

   create(name: string): Promise<IModel> {
      let model = new Model(this.parent, name, this.context)
      return Promise.resolve(model)
   }

   get(name: string): IModel | undefined {
      for(let model of super.items) {
         if(model.name.toLowerCase() === name.toLowerCase()) {
            return model
         }
      }

      return undefined
   }

   delete(name: string): Promise<void> {
      let found = this.get(name)

      if(found === undefined) {
         return Promise.resolve()
      }

      super.remove(found)
      
      return Promise.resolve()
   }
}