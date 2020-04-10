import { 
   IInstance,
   IField,
   INamespace,
   IQualifiedObject,
   IRfcAction,
   IMember } from "."

export class FieldCreateAction implements IRfcAction {
   readonly type: string = 'field-create'
   readonly instance: IInstance
   readonly field: IField

   constructor(instance: IInstance, field: IField) {
      this.instance = instance
      this.field = field
   }
}

export class MemberCreateAction implements IRfcAction {
   readonly type: string = 'member-create'
   readonly member: IMember

   constructor(member: IMember) {
      this.member = member
   }
}

export class ParentChangeAction implements IRfcAction {
   readonly type: string = 'qualifiedobject-parent-change'
   readonly source: IQualifiedObject
   readonly from: INamespace
   readonly to: INamespace

   constructor(source: IQualifiedObject, from: INamespace, to: INamespace) {
      this.source = source
      this.from = from
      this.to = to
   }
}