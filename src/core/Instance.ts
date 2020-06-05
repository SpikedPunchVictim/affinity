import { 
   IFieldCollection,
   FieldCollection, 
   ObservableEvents} from "./collections";

import { IField, Field, FieldRestoreInfo } from './Field'
import { IModel } from './Model'
import { INamespace } from './Namespace'
import { IQualifiedObject, QualifiedObject } from './QualifiedObject'
import { IProjectContext } from './Project'
import { Events } from './Events'
import { emit } from "./utils/Eventing";
import { FieldCreateAction, FieldDeleteAction, FieldReorderAction } from "..";
import { ItemAdd } from "./collections/ChangeSets";
import { syncToMaster } from "./utils/Collections";
import { IMember } from "./Member";
import { QualifiedObjectType } from "./utils";
import { RestoreInfo } from './Restore'

export class InstanceLazyRestoreInfo extends RestoreInfo {
   modelId: string = ""      // QualifiedName of the Model

   constructor(
      name: string = "",
      qualifiedName: string = "",
      id: string = "",
      modelId: string = "",
      parentId: string = "",
      index: number = -1) {
      super(name, qualifiedName, id, parentId, index)
      this.modelId = modelId
   }
}

export class InstanceFullRestoreInfo extends InstanceLazyRestoreInfo {
   fields: Array<FieldRestoreInfo> = new Array<FieldRestoreInfo>()

   constructor(
      name: string = "",
      qualifiedName: string = "",
      id: string = "",
      modelId: string = "",
      parentId: string = "",
      index: number = -1) {
         super(name, qualifiedName, id, modelId, parentId, index)
      }
}

export interface IInstance extends IQualifiedObject {
   readonly model: IModel
   readonly fields: IFieldCollection

   get(name: string): Promise<IField | undefined>
}

export class Instance 
   extends QualifiedObject
   implements IInstance {

   readonly model: IModel
   readonly fields: IFieldCollection

   constructor(name: string, parent: INamespace, model: IModel, context: IProjectContext, id: string) {
      super(name, parent, QualifiedObjectType.Instance, context, id)
      this.model = model
      this.fields = new FieldCollection(this, this.context)

      this.model.on(Events.Model.MemberAdded, this.onSyncFields.bind(this))
      this.model.on(Events.Model.MemberRemoved, this.onSyncFields.bind(this))
      this.model.on(Events.Model.MemberMoved, this.onSyncFields.bind(this))
      this.model.on(Events.Model.ValueChanged, this.onSyncFields.bind(this))
   }

   async get(name: string): Promise<IField | undefined> {
      return this.fields.get(name)
   }

   onSyncFields(): void {
      syncToMaster<IMember, IField>(
         this.model.members.observable,
         this.fields.observable, {
            equal: (member, field) => member.id === field.id,
            add: (member, index, fields) => this.onSyncFieldAdd(new Field(this, member, member.value.clone()), index),
            remove: (field, index, fields) => this.onSyncFieldRemove(field),
            move: (field, from, to, fields) => this.onSyncFieldMove(field, from, to)
         })
   }

   onSyncFieldAdd(field: IField, index: number): void {
      let fields = this.fields

      fields.observable.customAdd(field, (change, add) => {
         let action = new FieldCreateAction(field)

         let ch = new ItemAdd<IField>(field, index)

         emit([
            { source: fields.observable, event: ObservableEvents.adding, data: [ch] },
            { source: fields, event: ObservableEvents.adding, data: [ch] },
            { source: this, event: Events.Instance.FieldAdding, data: action },
            { source: this.context.project, event: Events.Instance.FieldAdding, data: action }
         ])

         add([ch])

         emit([
            { source: fields.observable, event: ObservableEvents.added, data: [ch] },
            { source: fields, event: ObservableEvents.added, data: [ch] },
            { source: this, event: Events.Instance.FieldAdded, data: action },
            { source: this.context.project, event: Events.Instance.FieldAdded, data: action }
         ])
      })
   }

   onSyncFieldRemove(field: IField): void {
      let fields = this.fields

      fields.observable.customRemove(field, (change, remove) => {
         let action = new FieldDeleteAction(field)

         emit([
            { source: fields.observable, event: ObservableEvents.removing, data: change },
            { source: fields, event: ObservableEvents.removing, data: change },
            { source: this, event: Events.Instance.FieldRemoving, data: action },
            { source: this.context.project, event: Events.Instance.FieldRemoving, data: action }
         ])

         remove()

         emit([
            { source: fields.observable, event: ObservableEvents.removed, data: change },
            { source: fields, event: ObservableEvents.removed, data: change },
            { source: this, event: Events.Instance.FieldRemoved, data: action },
            { source: this.context.project, event: Events.Instance.FieldRemoved, data: action }
         ])
      })
   }

   onSyncFieldMove(field: IField, from: number, to: number): void {
      let fields = this.fields

      fields.observable.customMove(from, to, (change, move) => {
         let action = new FieldReorderAction(field, from, to)

         emit([
            { source: fields.observable, event: ObservableEvents.moving, data: change },
            { source: fields, event: ObservableEvents.moving, data: change },
            { source: this, event: Events.Instance.FieldMoving, data: action },
            { source: this.context.project, event: Events.Instance.FieldMoving, data: action }
         ])

         move()

         emit([
            { source: fields.observable, event: ObservableEvents.moved, data: change },
            { source: fields, event: ObservableEvents.moved, data: change },
            { source: this, event: Events.Instance.FieldMoved, data: action },
            { source: this.context.project, event: Events.Instance.FieldMoved, data: action }
         ])
      })
   }
}