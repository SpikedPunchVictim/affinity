import { CreateAction, DeleteAction, RenameAction, MoveAction, ReorderAction, ValueChangeAction, RfcAction, UpdateAction, GetByIdAction } from "./Actions"
import { IInstance, InstanceFullRestoreInfo, InstanceLazyRestoreInfo } from "../Instance"
import { IField, FieldRestoreInfo, FieldAttachment } from "../Field"
import { INamespace } from "../Namespace"
import { IValue } from "../values/Value"
import { ActionSet } from './ActionSet'
import { QualifiedObjectGetChildrenAction } from "./QualifiedObject"

export class InstanceCreateAction extends CreateAction<IInstance> {
   static readonly type: string = ActionSet.InstanceCreate

   constructor(instance: IInstance, index: number) {
      super(InstanceCreateAction.type, instance, index)
   }
}

export class InstanceDeleteAction extends DeleteAction<IInstance> {
   static readonly type: string = ActionSet.InstanceDelete

   constructor(instance: IInstance) {
      super(InstanceDeleteAction.type, instance)
   }
}

export class InstanceGetByIdAction extends GetByIdAction {
   static readonly type: string = ActionSet.NamespaceGetById

   get restore(): InstanceLazyRestoreInfo | undefined {
      return this._restore
   }

   private _restore: InstanceLazyRestoreInfo | undefined = undefined

   constructor(id: string) {
      super(InstanceGetByIdAction.type, id)
   }
   
   set(restore: InstanceLazyRestoreInfo): void {
      this._restore = restore
   }
}

export class InstanceGetChildrenAction extends QualifiedObjectGetChildrenAction<InstanceLazyRestoreInfo> {
   static readonly type: string = ActionSet.InstanceGetChildren

   constructor(parent: INamespace) {
      super(InstanceGetChildrenAction.type, parent)
   }
}

export class InstanceMoveAction extends MoveAction<IInstance> {
   static readonly type: string = ActionSet.InstanceMove

   constructor(instance: IInstance, from: INamespace, to: INamespace) {
      super(InstanceMoveAction.type, instance, from, to)
   }
}

export class InstanceRenameAction extends RenameAction<IInstance> {
   static readonly type: string = ActionSet.InstanceRename

   constructor(instance: IInstance, from: string, to: string) {
      super(InstanceRenameAction.type, instance, from, to)
   }
}

export class InstanceReorderAction extends ReorderAction<IInstance> {
   static readonly type: string = ActionSet.InstanceReorder

   constructor(instance: IInstance, from: number, to: number) {
      super(InstanceReorderAction.type, instance, from, to)
   }
}

export class InstanceUpdateAction extends UpdateAction<IInstance, InstanceFullRestoreInfo> {
   static readonly type: string = ActionSet.InstanceUpdate

   constructor(model: IInstance) {
      super(InstanceUpdateAction.type, model)
   }
}

/*
The following Field Actions only get raised on the Project level. They
don't need to make their way to the Plugin:
   * FieldAttachmentChangeAction
   * FieldCreateAction
   * FieldDeleteAction
   * FieldRenameAction
   * FieldReorderAction

The ones that make it to the plugins are:
   * FieldGetAction
   * FieldResetAction
   * FieldValueChangeAction
*/

export class FieldAttachmentChangeAction extends RfcAction {
   static readonly type: string = ActionSet.FieldAttachmentChange

   readonly field: IField
   readonly oldValue: FieldAttachment
   readonly newValue: FieldAttachment
   
   constructor(field: IField, oldValue: FieldAttachment, newValue: FieldAttachment) {
      super(FieldAttachmentChangeAction.type)
      this.field = field
      this.oldValue = oldValue
      this.newValue = newValue
   }
}
export class FieldCreateAction extends CreateAction<IField> {
   static readonly type: string = ActionSet.FieldCreate

   // index is ignored for the Field. It shares its index with its Member
   constructor(field: IField) {
      super(FieldCreateAction.type, field, -1)
   }
}

export class FieldDeleteAction extends DeleteAction<IField> {
   static readonly type: string = ActionSet.FieldDelete

   constructor(field: IField) {
      super(InstanceRenameAction.type, field)
   }
}

export class FieldGetAction extends RfcAction {
   static readonly type: string = ActionSet.FieldGet
   readonly instance: IInstance

   restore: Array<FieldRestoreInfo> = new Array<FieldRestoreInfo>()

   get contentsUpdated(): boolean {
      return this._contentsUpdated
   }

   private _contentsUpdated: boolean = false

   constructor(instance: IInstance) {
      super(FieldGetAction.type)
      this.instance = instance
   }

   set(items: FieldRestoreInfo[]): void {
      this.restore = items
      this._contentsUpdated = true
   }
}

export class FieldRenameAction extends RenameAction<IField> {
   static readonly type: string = ActionSet.FieldRename

   constructor(field: IField, from: string, to: string) {
      super(InstanceRenameAction.type, field, from, to)
   }
}

export class FieldResetAction extends RfcAction {
   static readonly type: string = ActionSet.FieldReset

   readonly field: IField

   constructor(field: IField) {
      super(FieldResetAction.type)
      this.field = field
   }
}

export class FieldReorderAction extends ReorderAction<IField> {
   static readonly type: string = ActionSet.FieldReorder

   constructor(field: IField, from: number, to: number) {
      super(FieldReorderAction.type, field, from, to)
   }
}

export class FieldValueChangeAction extends ValueChangeAction<IField> {
   static readonly type: string = ActionSet.FieldValueChange

   constructor(field: IField, oldValue: IValue, newValue: IValue) {
      super(FieldValueChangeAction.type, field, oldValue, newValue)
   }
}