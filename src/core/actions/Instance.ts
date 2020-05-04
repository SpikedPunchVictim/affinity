import { CreateAction, DeleteAction, RenameAction, MoveAction, ReorderAction, ValueChangeAction } from "./Actions"
import { IInstance } from "../Instance"
import { IField } from "../Field"
import { INamespace } from "../.."
import { IValue } from "../values/Value"

export class InstanceCreateAction extends CreateAction<IInstance> {
   static readonly type: string = 'instance-create'
   readonly type: string = InstanceCreateAction.type

   constructor(instance: IInstance) {
      super(InstanceCreateAction.type, instance)
   }
}

export class InstanceDeleteAction extends DeleteAction<IInstance> {
   static readonly type: string = 'instance-delete'

   constructor(instance: IInstance) {
      super(InstanceDeleteAction.type, instance)
   }
}

export class InstanceMoveAction extends MoveAction<IInstance> {
   static readonly type: string = 'instance-move'

   constructor(instance: IInstance, from: INamespace, to: INamespace) {
      super(InstanceMoveAction.type, instance, from, to)
   }
}

export class InstanceRenameAction extends RenameAction<IInstance> {
   static readonly type: string = 'instance-rename'

   constructor(instance: IInstance, from: string, to: string) {
      super(InstanceRenameAction.type, instance, from, to)
   }
}

export class FieldCreateAction extends CreateAction<IField> {
   static readonly type: string = 'field-create'
   readonly type: string = FieldCreateAction.type

   constructor(field: IField) {
      super(FieldCreateAction.type, field)
   }
}

export class FieldDeleteAction extends DeleteAction<IField> {
   static readonly type: string = 'field-delete'

   constructor(field: IField) {
      super(InstanceRenameAction.type, field)
   }
}

export class FieldRenameAction extends RenameAction<IField> {
   static readonly type: string = 'field-rename'

   constructor(field: IField, from: string, to: string) {
      super(InstanceRenameAction.type, field, from, to)
   }
}

export class FieldReorderAction extends ReorderAction<IField> {
   static readonly type: string = 'field-reorder'

   constructor(field: IField, from: number, to: number) {
      super(FieldReorderAction.type, field, from, to)
   }
}

export class FieldValueChangeAction extends ValueChangeAction<IField> {
   static readonly type: string = 'field-value-change'

   constructor(field: IField, oldValue: IValue, newValue: IValue) {
      super(FieldValueChangeAction.type, field, oldValue, newValue)
   }
}