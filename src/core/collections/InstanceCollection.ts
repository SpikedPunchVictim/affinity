import { 
   IInstance,
   INamespace,
   IProjectContext, 
   IModel } from ".."

import { Instance } from ".."
import { NamedCollection, INamedCollection } from './NamedCollection'
import { InstanceCreateAction, IRequestForChangeSource } from "../actions"

export interface IInstanceCollection extends INamedCollection<IInstance> {
   create(name: string, model: IModel): Promise<IInstance>
}

export class InstanceCollection 
   extends NamedCollection<IInstance>
   implements IInstanceCollection {
   
   readonly parent: INamespace
   readonly context: IProjectContext

   private get rfc(): IRequestForChangeSource {
      return this.context.rfc
   }
   
   constructor(parent: INamespace, context: IProjectContext) {
      super()
      this.parent = parent
      this.context = context
   }

   async create(name: string, model: IModel): Promise<IInstance> {
      let instance = new Instance(this.parent, model, name, this.context)

      let rfc = this.rfc.create(new InstanceCreateAction(instance))

      await rfc
         .fulfill(async () => {
            await this.add(instance, { ignoreChangeRequest: true })
         })
         .commit()

      return Promise.resolve(instance)
   }
}