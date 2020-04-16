import { QualifiedObject } from './QualifiedObject'

import { 
   IField,
   IModel,
   INamespace,
   IQualifiedObject,
   IProjectContext } from ".";

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

   constructor(parent: INamespace, model: IModel, name: string, context: IProjectContext) {
      super(parent, name, context)
      this.model = model
      this.fields = new FieldCollection(this, this.context)
   }

   get(name: string): IField | undefined {
      return this.fields.get(name)
   }
}