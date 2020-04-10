import { 
   IInstance,
   INamespace,
   IProjectContext,
   ObservableCollection, 
   IModel } from ".."

import { Instance } from ".."

export interface IInstanceCollection {
   create(model: IModel, name: string): Promise<IInstance>
   get(name: string): IInstance | undefined
}

export class InstanceCollection 
   extends ObservableCollection<IInstance>
   implements IInstanceCollection {
   
   readonly parent: INamespace
   readonly context: IProjectContext
   
   constructor(parent: INamespace, context: IProjectContext) {
      super()
      this.parent = parent
      this.context = context
   }

   create(model: IModel, name: string): Promise<IInstance> {
      let instance = new Instance(this.parent, model, name, this.context)
      return Promise.resolve(instance)
   }

   get(name: string): IInstance | undefined {
      for(let model of super.items) {
         if(model.name.toLowerCase() === name.toLowerCase()) {
            return model
         }
      }

      return undefined
   }
}