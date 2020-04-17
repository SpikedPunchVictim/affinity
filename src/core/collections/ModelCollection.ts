import { IProjectContext } from "../Project";
import { IModel, Model } from "../Model";
import { INamespace } from '../Namespace'
import { NamedCollection, INamedCollection } from "./NamedCollection";
import { IRequestForChangeSource, ModelCreateAction } from "../actions";

export interface IModelCollection extends INamedCollection<IModel> {
   create(name: string): Promise<IModel>
}

export class ModelCollection 
   extends NamedCollection<IModel>
   implements IModelCollection {
   
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

   async create(name: string): Promise<IModel> {
      let model = new Model(this.parent, name, this.context)

      await this.rfc.create(new ModelCreateAction(model))
         .fulfill(async () => {
            await this.add(model, { ignoreChangeRequest: true })
            return
         })
         .commit()

      return model
   }
}