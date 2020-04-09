import { IQualifiedObject, QualifiedObject } from './QualifiedObject'
import { EditHandler } from './Edit';
import { INamespace } from './Namespace';
import { EventHandler } from './events/EventRouter';
import { IEvent } from './events/Base';
import { MemberCollection, IMemberCollection } from './collections/MemberCollection';
import { IProjectContext } from './Project';


export interface IModelListener {
   valueChanging(handler: any): void
   valueChanged(handler: any): void
}

export class ModelEdit {

}

export interface IModel extends IQualifiedObject {
   readonly members: IMemberCollection
   apply(model: EditHandler<ModelEdit>): Promise<IModel>
   on<T extends IEvent>(handler: EventHandler<T>): void
}

export class Model extends QualifiedObject implements IModel {
   readonly members: IMemberCollection
   readonly context: IProjectContext

   constructor(parent: INamespace, name: string, context: IProjectContext) {
      super(parent, name)
      this.context = context
      this.members = new MemberCollection(this, this.context)
   }

   on<T extends IEvent>(handler: EventHandler<T>): void {

   }

   apply(model: EditHandler<ModelEdit>): Promise<IModel> {
      return Promise.resolve(this)
   }
}

/*
let rfc = model.rfc()

model.members

model.add({
   cost: 0,
   size: 3,
   name: ''
})


*/
