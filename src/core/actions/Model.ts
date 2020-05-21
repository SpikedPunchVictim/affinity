import { CreateAction, DeleteAction, MoveAction, RenameAction, ReorderAction, ValueChangeAction, RfcAction } from "./Actions"
import { IMember, MemberInfo } from "../Member"
import { IModel } from "../Model"
import { INamespace } from "../Namespace"
import { IValue } from "../values/Value"
import { ActionSet } from './ActionSet'
import { QualifiedObjectGetAction } from "./QualifiedObject"
import { IndexableItem } from "../collections/ChangeSets"

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
   readonly model: IModel
   readonly index: number

   constructor(model: IModel, member: IMember, index: number) {
      super(MemberCreateAction.type, member)
      this.model = model
      this.index = index
   }
}

export class MemberDeleteAction extends DeleteAction<IMember> {
   static readonly type: string = ActionSet.MemberDelete

   constructor(member: IMember) {
      super(MemberDeleteAction.type, member)
   }
}

export class MemberGetAction extends RfcAction {
   static readonly type: string = ActionSet.MemberGet
   readonly model: IModel

   results: Array<IndexableItem<MemberInfo>> = new Array<IndexableItem<MemberInfo>>()

   get contentsUpdated(): boolean {
      return this._contentsUpdated
   }

   private _contentsUpdated: boolean = false

   constructor(model: IModel) {
      super(MemberGetAction.type)
      this.model = model
   }

   set(items: IndexableItem<MemberInfo>[]): void {
      this.results = items
      this._contentsUpdated = true
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

   get model(): IModel {
      return this.source.model
   }

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