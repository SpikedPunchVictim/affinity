import { CreateAction, DeleteAction, RenameAction, MoveAction, ReorderAction, ValueChangeAction, RfcAction } from "./Actions"
import { IInstance } from "../Instance"
import { IField, FieldInfo } from "../Field"
import { INamespace } from "../Namespace"
import { IValue } from "../values/Value"
import { ActionSet } from './ActionSet'
import { QualifiedObjectGetAction } from "./QualifiedObject"
import { IndexableItem } from "../collections/ChangeSets"

export class InstanceCreateAction extends CreateAction<IInstance> {
   static readonly type: string = ActionSet.InstanceCreate
   readonly type: string = InstanceCreateAction.type

   constructor(instance: IInstance) {
      super(InstanceCreateAction.type, instance)
   }
}

export class InstanceDeleteAction extends DeleteAction<IInstance> {
   static readonly type: string = ActionSet.InstanceDelete

   constructor(instance: IInstance) {
      super(InstanceDeleteAction.type, instance)
   }
}

export class InstanceGetAction extends QualifiedObjectGetAction<IInstance> {
   static readonly type: string = ActionSet.InstanceGet

   constructor(parent: INamespace, indexes: number[] | undefined) {
      super(InstanceGetAction.type, parent, indexes)
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

export class FieldCreateAction extends CreateAction<IField> {
   static readonly type: string = ActionSet.FieldCreate
   readonly type: string = FieldCreateAction.type

   constructor(field: IField) {
      super(FieldCreateAction.type, field)
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

   results: Array<IndexableItem<FieldInfo>> = new Array<IndexableItem<FieldInfo>>()

   get contentsUpdated(): boolean {
      return this._contentsUpdated
   }

   private _contentsUpdated: boolean = false

   constructor(instance: IInstance) {
      super(FieldGetAction.type)
      this.instance = instance
   }

   set(items: IndexableItem<FieldInfo>[]): void {
      this.results = items
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