import { 
   IField,
   IModel,
   INamespace,
   IQualifiedObject,
   IProjectContext,
   QualifiedObject } from ".";

import { 
   IFieldCollection,
   FieldCollection } from "./collections";

export interface IInstance extends IQualifiedObject {
   readonly model: IModel
   readonly fields: IFieldCollection

   get(name: string): IField | undefined
}

export class Instance 
   extends QualifiedObject
   implements IInstance {

   readonly model: IModel
   readonly fields: IFieldCollection
   readonly context: IProjectContext

   constructor(parent: INamespace, model: IModel, name: string, context: IProjectContext) {
      super(parent, name)
      this.model = model
      this.context = context
      this.fields = new FieldCollection(this, this.context)
   }

   get(name: string): IField | undefined {
      return this.fields.get(name)
   }
}