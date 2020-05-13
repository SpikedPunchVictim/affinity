import { IQualifiedObject, QualifiedObject } from './QualifiedObject'
import { EditHandler } from './Edit';
import { INamespace } from './Namespace';
import { MemberCollection, IMemberCollection } from './collections/MemberCollection';
import { IProjectContext } from './Project';
import { ModelRenameAction } from './actions/Model';


export interface IModelListener {
   valueChanging(handler: any): void
   valueChanged(handler: any): void
}

export class ModelEdit {

}

export interface IModel extends IQualifiedObject {
   readonly members: IMemberCollection
   apply(model: EditHandler<ModelEdit>): Promise<IModel>
}

export class Model extends QualifiedObject implements IModel {
   readonly members: IMemberCollection

   constructor(id: string, parent: INamespace, name: string, context: IProjectContext) {
      super(id, parent, name, context)
      this.members = new MemberCollection(this, this.context)
   }

   apply(model: EditHandler<ModelEdit>): Promise<IModel> {
      return Promise.resolve(this)
   }

   protected onRename(newName: string): Promise<void> {
      let rfc = this.rfc.create(new ModelRenameAction(this, this.name, newName))

      return rfc
         .fulfill(() => {
            this._name = newName
            return Promise.resolve()
         })
         .commit()
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
