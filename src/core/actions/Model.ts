import { CreateAction, DeleteAction, MoveAction, RenameAction, ReorderAction, ValueChangeAction } from "./Actions"
import { IMember } from "../Member"
import { IModel } from "../Model"
import { INamespace } from "../Namespace"
import { IValue } from "../values/Value"

export class ModelCreateAction extends CreateAction<IModel> {
   static readonly type: string = 'model-create'
   readonly type: string = ModelCreateAction.type

   constructor(model: IModel) {
      super(ModelCreateAction.type, model)
   }
}

export class ModelDeleteAction extends DeleteAction<IModel> {
   static readonly type: string = 'model-delete'

   constructor(model: IModel) {
      super(ModelDeleteAction.type, model)
   }
}

export class ModelMoveAction extends MoveAction<IModel> {
   static readonly type: string = 'model-move'

   constructor(model: IModel, from: INamespace, to: INamespace) {
      super(ModelMoveAction.type, model, from, to)
   }
}

export class ModelRenameAction extends RenameAction<IModel> {
   static readonly type: string = 'model-rename'

   constructor(model: IModel, from: string, to: string) {
      super(ModelRenameAction.type, model, from, to)
   }
}

export class MemberCreateAction extends CreateAction<IMember> {
   static readonly type: string = 'member-create'

   constructor(member: IMember) {
      super(MemberCreateAction.type, member)
   }
}

export class MemberDeleteAction extends DeleteAction<IMember> {
   static readonly type: string = 'member-delete'

   constructor(member: IMember) {
      super(MemberDeleteAction.type, member)
   }
}

export class MemberRenameAction extends RenameAction<IMember> {
   static readonly type: string = 'member-rename'

   constructor(member: IMember, from: string, to: string) {
      super(MemberRenameAction.type, member, from, to)
   }
}

export class MemberReorderAction extends ReorderAction<IMember> {
   static readonly type: string = 'member-reorder'

   constructor(member: IMember, from: number, to: number) {
      super(MemberReorderAction.type, member, from, to)
   }
}

export class MemberValueChangeAction extends ValueChangeAction<IMember> {
   static readonly type: string = 'member-value-change'

   constructor(member: IMember, oldValue: IValue, newValue: IValue) {
      super(MemberValueChangeAction.type, member, oldValue, newValue)
   }
}