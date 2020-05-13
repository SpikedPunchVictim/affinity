import { CreateAction, DeleteAction, MoveAction, RenameAction, ReorderAction, ValueChangeAction } from "./Actions"
import { IMember } from "../Member"
import { IModel } from "../Model"
import { INamespace } from "../Namespace"
import { IValue } from "../values/Value"
import { ActionSet } from './ActionSet'
import { QualifiedObjectGetAction } from "./QualifiedObject"

export class ModelCreateAction extends CreateAction<IModel> {
   static readonly type: string = ActionSet.ModelCreate
   readonly type: string = ModelCreateAction.type

   constructor(model: IModel) {
      super(ModelCreateAction.type, model)
   }
}

export class ModelDeleteAction extends DeleteAction<IModel> {
   static readonly type: string = ActionSet.ModelDelete

   constructor(model: IModel) {
      super(ModelDeleteAction.type, model)
   }
}

export class ModelGetAction extends QualifiedObjectGetAction<IModel> {
   static readonly type: string = ActionSet.ModelGet

   constructor(parent: INamespace, indexes: number[] | undefined) {
      super(ModelGetAction.type, parent, indexes)
   }
}

export class ModelMoveAction extends MoveAction<IModel> {
   static readonly type: string = ActionSet.ModelMove

   constructor(model: IModel, from: INamespace, to: INamespace) {
      super(ModelMoveAction.type, model, from, to)
   }
}

export class ModelRenameAction extends RenameAction<IModel> {
   static readonly type: string = ActionSet.ModelRename

   constructor(model: IModel, from: string, to: string) {
      super(ModelRenameAction.type, model, from, to)
   }
}

export class ModelReorderAction extends ReorderAction<IModel> {
   static readonly type: string = ActionSet.ModelReorder

   constructor(model: IModel, from: number, to: number) {
      super(ModelReorderAction.type, model, from, to)
   }
}

export class MemberCreateAction extends CreateAction<IMember> {
   static readonly type: string = ActionSet.MemberCreate

   constructor(member: IMember) {
      super(MemberCreateAction.type, member)
   }
}

export class MemberDeleteAction extends DeleteAction<IMember> {
   static readonly type: string = ActionSet.MemberDelete

   constructor(member: IMember) {
      super(MemberDeleteAction.type, member)
   }
}

export class MemberRenameAction extends RenameAction<IMember> {
   static readonly type: string = ActionSet.MemberRename

   constructor(member: IMember, from: string, to: string) {
      super(MemberRenameAction.type, member, from, to)
   }
}

export class MemberReorderAction extends ReorderAction<IMember> {
   static readonly type: string = ActionSet.MemberReorder

   constructor(member: IMember, from: number, to: number) {
      super(MemberReorderAction.type, member, from, to)
   }
}

export class MemberValueChangeAction extends ValueChangeAction<IMember> {
   static readonly type: string = ActionSet.MemberValueChange

   constructor(member: IMember, oldValue: IValue, newValue: IValue) {
      super(MemberValueChangeAction.type, member, oldValue, newValue)
   }
}