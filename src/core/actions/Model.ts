import { CreateAction, DeleteAction, MoveAction, RenameAction, ReorderAction, ValueChangeAction, RfcAction, UpdateAction, GetByIdAction } from "./Actions"
import { IMember, MemberRestoreInfo } from "../Member"
import { IModel, ModelFullRestoreInfo, ModelLazyRestoreInfo } from "../Model"
import { INamespace } from "../Namespace"
import { IValue } from "../values/Value"
import { ActionSet } from './ActionSet'
import { QualifiedObjectGetChildrenAction } from "./QualifiedObject"
import { IndexableItem } from "../collections/ChangeSets"

export class ModelCreateAction extends CreateAction<IModel> {
   static readonly type: string = ActionSet.ModelCreate

   constructor(model: IModel, index: number) {
      super(ModelCreateAction.type, model, index)
   }
}

export class ModelDeleteAction extends DeleteAction<IModel> {
   static readonly type: string = ActionSet.ModelDelete

   constructor(model: IModel) {
      super(ModelDeleteAction.type, model)
   }
}

export class ModelGetByIdAction extends GetByIdAction {
   static readonly type: string = ActionSet.NamespaceGetById

   get restore(): ModelLazyRestoreInfo | undefined {
      return this._restore
   }

   private _restore: ModelLazyRestoreInfo | undefined = undefined

   constructor(id: string) {
      super(ModelGetByIdAction.type, id)
   }
   
   set(restore: ModelLazyRestoreInfo): void {
      this._restore = restore
   }
}

export class ModelGetChildrenAction extends QualifiedObjectGetChildrenAction<ModelLazyRestoreInfo> {
   static readonly type: string = ActionSet.ModelGetChildren

   constructor(parent: INamespace) {
      super(ModelGetChildrenAction.type, parent)
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

export class ModelUpdateAction extends UpdateAction<IModel, ModelFullRestoreInfo> {
   static readonly type: string = ActionSet.ModelUpdate

   constructor(model: IModel) {
      super(ModelUpdateAction.type, model)
   }
}

export class MemberCreateAction extends CreateAction<IMember> {
   static readonly type: string = ActionSet.MemberCreate
   readonly model: IModel

   constructor(model: IModel, member: IMember, index: number) {
      super(MemberCreateAction.type, member, index)
      this.model = model
   }
}

export class MemberDeleteAction extends DeleteAction<IMember> {
   static readonly type: string = ActionSet.MemberDelete

   constructor(member: IMember) {
      super(MemberDeleteAction.type, member)
   }
}

/**
 * Retrieves all Members for a Model
 */
export class MemberGetAction extends RfcAction {
   static readonly type: string = ActionSet.MemberGet
   readonly model: IModel

   results: Array<IndexableItem<MemberRestoreInfo>> = new Array<IndexableItem<MemberRestoreInfo>>()

   get contentsUpdated(): boolean {
      return this._contentsUpdated
   }

   private _contentsUpdated: boolean = false

   constructor(model: IModel) {
      super(MemberGetAction.type)
      this.model = model
   }

   set(items: IndexableItem<MemberRestoreInfo>[]): void {
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