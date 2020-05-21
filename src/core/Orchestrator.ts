import { IQualifiedObject, QualifiedObject } from "./QualifiedObject";
import { INamespace, Namespace } from "./Namespace";
import { Switch, QualifiedObjectType, as, sortByType } from "./utils/Types";
import { emit } from './utils/Eventing'
import { IProject, IProjectContext } from "./Project";
import { ArgumentError } from "../errors/ArgumentError";
import { NameCollisionError } from "../errors/NameCollisionError";
import { ParentChangeAction, QualifiedObjectGetAction } from "./actions/QualifiedObject";

import {
   NamespaceCollection,
   ObservableEvents,
   ModelCollection,
   InstanceCollection
} from "./collections";

import {
   NamespaceRenameAction,
   ModelRenameAction,
   InstanceRenameAction,
   IRfcAction,
   NamespaceCreateAction,
   ModelCreateAction,
   InstanceCreateAction,
   MemberCreateAction,
   BatchedActions,
   NamespaceDeleteAction,
   ModelDeleteAction,
   InstanceDeleteAction,
   MemberValueChangeAction,
   FieldValueChangeAction,
   NamespaceReorderAction,
   ModelReorderAction,
   InstanceReorderAction,
   NamespaceGetAction,
   ModelGetAction,
   InstanceGetAction,
   MemberReorderAction,
   MemberDeleteAction,
   MemberGetAction
} from "./actions";

import { Events } from "./Events";
import { IModel, Model } from "./Model";
import { IInstance, Instance } from "./Instance";
import { RfcError } from "../errors/RfcError";
import { IMember, Member, MemberInfo } from "./Member";
import { Field, IField } from "./Field";
import { InvalidOperationError, IndexOutOfRangeError } from "../errors";
import { depthFirst } from "./utils/Search";
import { IValue, } from "./values/Value";
import { MemberValueChange, FieldValueChange } from "./values/Changes";
import { ChangeValueHandler } from "./values/ValueAttachment";
import { IndexableItem, ItemAdd } from "./collections/ChangeSets";
import { IQualifiedObjectCollection } from "./collections/QualifiedObjectCollection";
import { IUidWarden } from "./UidWarden";

export interface IOrchestrator {
   createNamespace(parent: INamespace, name: string): Promise<INamespace>
   createModel(parent: INamespace, name: string): Promise<IModel>
   createInstance(parent: INamespace, model: IModel, name: string): Promise<IInstance>

   // Members
   /**
    * All new Members are created through here. When importing, existing Members go through
    * a different flow.
    * 
    * @param model The Model the new Members belong to
    * @param params New Member information
    */
   createMembers(model: IModel, params: MemberInfo | Array<MemberInfo>): Promise<IndexableItem<IMember>[]>
   getMembers(model: IModel): Promise<IndexableItem<IMember>[]>
   reorderMember(model: IModel, from: number, to: number): Promise<IMember>
   deleteMembers(model: IModel, names: string[]): Promise<IndexableItem<IMember>[]>

   // Fields
   getFields(instance: IInstance): Promise<IndexableItem<IField>[]>
   
   /**
    * Updates the Instance Fields with the Model's Members
    * 
    * @param instance The Instance
    */
   syncFields(instance: IInstance): IndexableItem<IField>[]

   getQualifiedObjects<T extends IQualifiedObject>(type: QualifiedObjectType, parent: INamespace, indexes: number[] | undefined): Promise<IndexableItem<T>[]>
   delete<T extends IQualifiedObject>(item: T | T[]): Promise<boolean>
   rename(source: IQualifiedObject, newName: string): Promise<IQualifiedObject>

   /**
    * Moves a Qualified Object to a new parent.
    * 
    * @param source The source to move
    * @param to The new parent Namesapce
    * @returns Returns the source Qualified Object
    */
   move(source: IQualifiedObject, to: INamespace): Promise<IQualifiedObject>
   reorder(source: IQualifiedObject, from: number, to: number): Promise<IQualifiedObject>
   updateMemberValue(member: IMember, oldValue: IValue, newValue: IValue, changeValue: ChangeValueHandler): Promise<IValue>
   updateFieldValue(field: IField, oldValue: IValue, newValue: IValue, changeValue: ChangeValueHandler): Promise<IValue>
}

type ChangeHandler = () => void

type PrePostChangeHandlers = {
   before?: ChangeHandler
   after?: ChangeHandler
}

export class Orchestrator implements IOrchestrator {
   readonly project: IProject
   readonly context: IProjectContext

   private get rfc() {
      return this.project.rfc
   }

   private get uidGenerator(): IUidWarden {
      return this.context.uidWarden
   }

   constructor(project: IProject, context: IProjectContext) {
      this.project = project
      this.context = context
   }

   getAllChildren(parent: INamespace): Array<IQualifiedObject> {
      let results = new Array<IQualifiedObject>()

      for (let model of parent.models.toArray()) {
         results.push(model)
      }

      for (let inst of parent.instances.toArray()) {
         results.push(inst)
      }

      for (let ns of parent.children.toArray()) {
         results.push(...(this.getAllChildren(ns)))
      }

      return results
   }

   _getOwningCollection<T extends IQualifiedObject>(obj: IQualifiedObject): IQualifiedObjectCollection<T> {
      return Switch.case(obj, {
         //@ts-ignore
         Namespace: (ns) => ns.parent.children,
         //@ts-ignore
         Model: (model) => model.parent.models,
         //@ts-ignore
         Instance: (inst) => inst.parent.instances
      })
   }

   _remove<T extends IQualifiedObject>(obj: T, action: IRfcAction, changeHandlers?: PrePostChangeHandlers): void {
      let parentEvent = Switch.case(obj, {
         Namespace: () => ({ notifying: Events.Namespace.ChildRemoving, notified: Events.Namespace.ChildRemoved }),
         Model: () => ({ notifying: Events.Namespace.ModelRemoving, notified: Events.Namespace.ModelRemoved }),
         Instance: () => ({ notifying: Events.Namespace.InstanceRemoving, notified: Events.Namespace.InstanceRemoved }),
      })

      let collection = this._getOwningCollection(obj)

      collection.observable.mutedRemove(obj, (change, remove) => {
         // Cache off the parent
         let parent = obj.parent

         emit([
            { source: collection.observable, event: ObservableEvents.removing, data: change },
            { source: collection, event: ObservableEvents.removing, data: change },
            //@ts-ignore
            { source: parent, event: parentEvent.notifying, data: action },
            { source: this.project, event: parentEvent.notifying, data: action },
         ])

         changeHandlers?.before?.()

         remove()

         changeHandlers?.after?.()

         emit([
            { source: collection.observable, event: ObservableEvents.removed, data: change },
            { source: collection, event: ObservableEvents.removed, data: change },
            //@ts-ignore
            { source: parent, event: parentEvent.notified, data: action },
            { source: this.project, event: parentEvent.notified, data: action },
         ])
      })
   }

   _add<T extends IQualifiedObject>(
      obj: T,
      parent: INamespace,
      action: IRfcAction,
      changeHandlers?: PrePostChangeHandlers): void {

      let parentEvent = Switch.case(obj, {
         Namespace: () => ({ notifying: Events.Namespace.ChildAdding, notified: Events.Namespace.ChildAdded }),
         Model: () => ({ notifying: Events.Namespace.ModelAdding, notified: Events.Namespace.ModelAdded }),
         Instance: () => ({ notifying: Events.Namespace.InstanceAdding, notified: Events.Namespace.InstanceAdded }),
      })

      let collection = Switch.case<IQualifiedObjectCollection<T>>(obj, {
         //@ts-ignore
         Namespace: (ns) => parent.children,
         //@ts-ignore
         Model: (model) => parent.models,
         //@ts-ignore
         Instance: (inst) => parent.instances
      })

      collection.observable.mutedAdd(obj, (change, add) => {
         emit([
            { source: collection.observable, event: ObservableEvents.adding, data: change },
            { source: collection, event: ObservableEvents.adding, data: change },
            //@ts-ignore
            { source: parent, event: parentEvent.notifying, data: action },
            { source: this.project, event: parentEvent.notifying, data: action }
         ])

         changeHandlers?.before?.()

         add()

         changeHandlers?.after?.()

         emit([
            { source: collection.observable, event: ObservableEvents.added, data: change },
            { source: collection, event: ObservableEvents.added, data: change },
            //@ts-ignore
            { source: parent, event: parentEvent.notified, data: action },
            { source: this.project, event: parentEvent.notified, data: action }
         ])
      })
   }

   _reorder<T extends IQualifiedObject>(
      source: T,
      collection: IQualifiedObjectCollection<T>,   // The collection source lives in
      from: number,
      to: number,
      action: IRfcAction,
      changeHandlers?: PrePostChangeHandlers): void {

      let parentChange = Switch.case(source, {
         Namespace: (ns) => ({ notifying: Events.Namespace.ChildMoving, notified: Events.Namespace.ChildMoved }),
         Model: (model) => ({ notifying: Events.Namespace.ModelMoving, notified: Events.Namespace.ModelMoved }),
         Instance: (inst) => ({ notifying: Events.Namespace.InstanceMoving, notified: Events.Namespace.InstanceMoved })
      })

      collection.observable.mutedMove(from, to, (change, move) => {
         emit([
            { source: collection.observable, event: ObservableEvents.moving, data: change },
            { source: collection, event: ObservableEvents.moving, data: change },
            //@ts-ignore
            { source: source.parent, event: parentChange.notifying, data: action },
            { source: this.project, event: parentChange.notifying, data: action }
         ])

         changeHandlers?.before?.()

         move()

         changeHandlers?.after?.()

         emit([
            { source: collection.observable, event: ObservableEvents.moved, data: change },
            { source: collection, event: ObservableEvents.moved, data: change },
            //@ts-ignore
            { source: source.parent, event: parentChange.notified, data: action },
            { source: this.project, event: parentChange.notified, data: action }
         ])
      })
   }

   async delete(items: IQualifiedObject | IQualifiedObject[]): Promise<boolean> {
      if (!Array.isArray(items)) {
         items = [items]
      }

      /*
         To delete a QualifiedObject we:
            - Generate all of the Actions in a Batch
            - Commit an RFC for them
            - Remove all of the QualifiedObjects from their respective collections
      */

      let actions = new Map<IQualifiedObject, IRfcAction>()

      let generateAction = (obj: IQualifiedObject): IRfcAction => {
         return Switch.case<IRfcAction>(obj, {
            Namespace: (it) => new NamespaceDeleteAction(it),
            Model: (it) => new ModelDeleteAction(it),
            Instance: (it) => new InstanceDeleteAction(it)
         })
      }

      // Sort the items with the Namespaces having the highest priority.
      // This ensures we do not mark a Qualified Object for delete more than
      // once (ie if the QualifiedObject lives under a Namespace included in the list).
      // We filter duplicates in the next step where we generate IRfcActions
      items.sort(sortByType({
         Namespace: () => 3,
         Model: () => 2,
         Instance: () => 1
      }))

      // Generate RfcActions for each deleted object
      for (let item of items) {
         Switch.case(item, {
            Namespace: (ns) => {
               depthFirst<IQualifiedObject>(ns, obj => {
                  let results = new Array<IQualifiedObject>()

                  Switch.case(obj, {
                     Namespace: async (namespace) => {
                        for await (let child of namespace.children) {
                           results.push(child)
                        }

                        for await (let model of namespace.models) {
                           results.push(model)
                        }

                        for await (let inst of namespace.instances) {
                           results.push(inst)
                        }
                     },
                     Model: () => { },
                     Instance: () => { }
                  })

                  return results
               }, obj => actions.set(obj, generateAction(obj)))
            },
            Model: (obj) => {
               if (actions.get(item) !== undefined) {
                  return
               }

               let act = generateAction(item)
               actions.set(item, act)
            },
            Instance: (obj) => {
               if (actions.get(item) !== undefined) {
                  return
               }

               let act = generateAction(item)
               actions.set(item, act)
            }
         })
      }

      let act = new BatchedActions(Array.from(actions.values()))

      // Are all parents valid?
      for (let item of actions.keys()) {
         if (item.parent == null) {
            throw new InvalidOperationError(`One of the items being deleted does not have a valid parent: ${item.qualifiedName}`)
         }
      }

      //@ts-ignore
      await this.rfc.create(act)
         .fulfill(async (action) => {
            //@ts-ignore
            for (let item of actions.keys()) {
               let action = actions.get(item)

               //@ts-ignore
               this._remove(item, action, { after: () => as<QualifiedObject>(obj).orphan() })
            }
         })
         .commit()

      return true
   }

   async createNamespace(parent: INamespace, name: string): Promise<INamespace> {
      let namespace = new Namespace(name, parent, this.context, await this.uidGenerator.generate())

      await this.rfc.create(new NamespaceCreateAction(namespace))
         .fulfill(async (action) => {
            this._add(namespace, parent, action)
         })
         .reject(async (action: IRfcAction, err?: Error) => {
            throw new RfcError(action, err)
         })
         .commit()

      return namespace
   }

   async createModel(parent: INamespace, name: string): Promise<IModel> {
      let model = new Model(name, parent, this.context, await this.uidGenerator.generate())

      await this.rfc.create(new ModelCreateAction(model))
         .fulfill(async (action) => {
            this._add(model, parent, action)
         })
         .reject(async (action: IRfcAction, err?: Error) => {
            throw new RfcError(action, err)
         })
         .commit()

      return model
   }

   async createInstance(parent: INamespace, model: IModel, name: string): Promise<IInstance> {
      let instance = new Instance(name, parent, model, this.context, await this.uidGenerator.generate())

      await this.rfc.create(new InstanceCreateAction(instance))
         .fulfill(async (action) => {
            this._add(instance, parent, action)
         })
         .reject(async (action: IRfcAction, err?: Error) => {
            throw new RfcError(action, err)
         })
         .commit()

      return instance
   }

   async createMembers(model: IModel, params: MemberInfo | Array<MemberInfo>): Promise<IndexableItem<IMember>[]> {
      if (!Array.isArray(params)) {
         params = [params]
      }

      let actions = new Array<IndexableItem<MemberCreateAction>>()

      // Note: The id field is ignored since these Members have not been created yet
      let index = model.members.length
      for (let param of params) {
         let id = await this.context.uidWarden.generate()
         let member = new Member(model, param.name, param.value, this, id)
         let action = new MemberCreateAction(member.model, member, param.index || index)
         actions.push(new IndexableItem<MemberCreateAction>(action, param.index || index))
         index++
      }

      let toAdd: IndexableItem<IMember>[] = new Array<IndexableItem<IMember>>()

      await this.rfc.create(new BatchedActions(actions.map(a => a.item)))
         .fulfill(async (action) => {
            let collection = model.members
            let members = actions.map(a => a.item.source)

            collection.observable.mutedAdd(members, (change, add) => {
               // Provide order
               toAdd = actions.map(a => {
                  return new ItemAdd<IMember>(a.item.source, a.index)
               })

               emit([
                  { source: collection, event: ObservableEvents.adding, data: toAdd },
                  { source: collection.model, event: Events.Model.MemberAdding, data: action },
                  { source: this.project, event: Events.Model.MemberAdding, data: action }
               ])

               add(toAdd)

               emit([
                  { source: collection, event: ObservableEvents.added, data: change },
                  { source: collection.model, event: Events.Model.MemberAdded, data: action },
                  { source: this.project, event: Events.Model.MemberAdded, data: action }
               ])
            })
         })
         .reject(async (action: IRfcAction, err?: Error) => {
            throw new RfcError(action, err)
         })
         .commit()

      return toAdd
   }

   /**
    * Updates the Instance Fields with the Model's Members
    * 
    * @param instance The Instance
    */
   syncFields(instance: IInstance): IndexableItem<IField>[] {
      let model = instance.model

      let add = (member: IMember, index: number) => {
         let field = new Field(instance, member, member.value.clone())

         instance.fields.observable.mutedAdd(field, (change, add) => {
            emit([
               { source: instance.fields.observable, event: ObservableEvents.adding, data: change },
               { source: instance, event: Events.Instance.FieldAdding, data: change },
               { source: this.project, event: Events.Instance.FieldAdding, data: change }
            ])

            let ch = new ItemAdd(field, index)

            add([ch])

            emit([
               { source: instance.fields.observable, event: ObservableEvents.added, data: change },
               { source: instance, event: Events.Instance.FieldAdded, data: change },
               { source: this.project, event: Events.Instance.FieldAdded, data: change }
            ])
         })
      }

      for(let i = 0; i < model.members.length; ++i) {
         let member = model.members.observable.at(i)

         if(i >= instance.fields.length) {
            add(member, i)
            continue
         }

         let field = instance.fields.observable.at(i)

         if(member.id === field.id) {
            field.value.setLocally(member.value)
         }
      }

      /*
         let changeset = diffCollection(a, b)

         changeset.merge({
            add: (from, to) => {},
            remove: (index) => {},
            move: (from, to) => {}
         })

         // or
         observable.mergeInto(fromObservable, toObservable)


      */
   }

   getFields(instance: IInstance): Promise<IndexableItem<IField>[]> {
      //this.rfc.create(new Fi)
   }

   async getMembers(model: IModel): Promise<IndexableItem<IMember>[]> {

      let observable = model.members.observable

      let results = new Array<IndexableItem<IMember>>()

      await this.rfc.create(new MemberGetAction(model))
         .fulfill( async (action) => {
            let getAction = <MemberGetAction>action

            // If no contents were updated, return what exists now
            if(!getAction.contentsUpdated) {
               //@ts-ignore
               results = model.members.map(member => new IndexableItem<IMember>(member, observable.indexOf(member)))
               return
            }

            for(let { item } of getAction.results) {
               let member = new Member(model, item.name, item.value, this, item.id)
               results.push(new IndexableItem<IMember>(member, item.index))
            }
         })
         .commit()

      return results
   }

   async rename(source: IQualifiedObject, newName: string): Promise<IQualifiedObject> {
      let action = Switch.case<IRfcAction>(source, {
         Namespace: (obj) => new NamespaceRenameAction(obj, source.name, newName),
         Model: (obj) => new ModelRenameAction(obj, source.name, newName),
         Instance: (obj) => new InstanceRenameAction(obj, source.name, newName)
      })

      let qobj = as<QualifiedObject>(source)

      await this.rfc.create(action)
         .fulfill(async (action) => {
            source.emit(Events.QualifiedObject.NameChanging, action)

            emit([
               { source, event: Events.QualifiedObject.NameChanging, data: action },
               { source: this.project, event: Events.QualifiedObject.NameChanging, data: action }
            ])

            qobj.setName(newName)

            emit([
               { source, event: Events.QualifiedObject.NameChanged, data: action },
               { source: this.project, event: Events.QualifiedObject.NameChanged, data: action }
            ])

            return
         })
         .commit()

      return source
   }

   async move(source: IQualifiedObject, to: INamespace): Promise<IQualifiedObject> {
      if (source == null) {
         throw new ArgumentError(`source must be valid`)
      }

      if (source === this.project.root) {
         throw new ArgumentError(`Cannot move the Root namespace`)
      }

      if (source.parent == null) {
         throw new ArgumentError(`The source does not belong to any Namespace. Ensure that it exists in the project.`)
      }

      if (source.parent === to) {
         return Promise.resolve(source)
      }

      let found = await this.project.get(QualifiedObjectType.Namespace, to.qualifiedName)

      if (!found) {
         throw new ArgumentError(`The 'to' Namespace provided to move() doesn't exist in this project`)
      }

      // Is there a QualifiedObject with that name already at the destination?
      let exists = await Switch.case(source, {
         Namespace: async () => {
            let found = await to.children.get(source.name)
            return found !== undefined
         },
         Model: async () => {
            let found = await to.models.get(source.name)
            return found !== undefined
         },
         Instance: async () => {
            let found = await to.instances.get(source.name)
            return found !== undefined
         }
      })

      if (exists) {
         throw new NameCollisionError(`A QualifiedObject with that name already exists in the target location`)
      }

      await this.rfc.create(new ParentChangeAction(source, source.parent, to))
         .fulfill(async (action) => {
            let performMove = <T extends IQualifiedObject>(source: T, newParent: INamespace): void => {
               let hasRemoved = false
               try {
                  this._remove(source, action)
                  hasRemoved = true
                  this._add(source, newParent, action, { after: () => as<QualifiedObject>(source).setParent(newParent) })
               } catch (err) {
                  if (hasRemoved) {
                     // Recover from a failure
                     //@ts-ignore
                     this._add(source, source.parent)
                  }

                  throw err
               }
            }

            Switch.case(source, {
               Namespace: (ns) => performMove(ns, to),
               Model: (model) => performMove(model, to),
               Instance: (inst) => performMove(inst, to)
            })
         })
         .commit()

      return source
   }

   async updateMemberValue(member: IMember, oldValue: IValue, newValue: IValue, changeValue: ChangeValueHandler): Promise<IValue> {
      let change = new MemberValueChange(member, oldValue, newValue)
      let updatedValue: IValue

      await this.rfc.create(new MemberValueChangeAction(member, oldValue, newValue))
         .fulfill(async () => {
            emit([
               { source: member, event: Events.Member.ValueChanging, data: change },
               { source: member.model, event: Events.Model.ValueChanging, data: change },
               { source: this.project, event: Events.Model.ValueChanging, data: change }
            ])

            updatedValue = changeValue()

            emit([
               { source: member, event: Events.Member.ValueChanged, data: change },
               { source: member.model, event: Events.Model.ValueChanged, data: change },
               { source: this.project, event: Events.Model.ValueChanged, data: change }
            ])
         })
         .commit()

      //@ts-ignore
      return updatedValue
   }

   async updateFieldValue(field: IField, oldValue: IValue, newValue: IValue, changeValue: ChangeValueHandler): Promise<IValue> {
      let change = new FieldValueChange(field, oldValue, newValue)
      let updatedValue: IValue

      await this.rfc.create(new FieldValueChangeAction(field, oldValue, newValue))
         .fulfill(async () => {
            emit([
               { source: field, event: Events.Member.ValueChanging, data: change },
               { source: field.instance, event: Events.Instance.FieldValueChanging, data: change },
               { source: this.project, event: Events.Instance.FieldValueChanging, data: change }
            ])

            updatedValue = changeValue()

            emit([
               { source: field, event: Events.Member.ValueChanged, data: change },
               { source: field.instance, event: Events.Instance.FieldValueChanged, data: change },
               { source: this.project, event: Events.Instance.FieldValueChanged, data: change }
            ])
         })
         .commit()

      //@ts-ignore
      return updatedValue
   }

   async getQualifiedObjects<T extends IQualifiedObject>(type: QualifiedObjectType, parent: INamespace, indexes: number[] | undefined): Promise<IndexableItem<T>[]> {
      let action = Switch.onType<IRfcAction>(type, {
         Namespace: () => new NamespaceGetAction(parent, indexes),
         Model: () => new ModelGetAction(parent, indexes),
         Instance: () => new InstanceGetAction(parent, indexes)
      })

      let results: Array<IndexableItem<T>> = new Array<IndexableItem<T>>()

      await this.rfc.create(action)
         .fulfill(async () => {
            let getAction = <QualifiedObjectGetAction<T>>action

            if (getAction.contentsUpdated) {
               results = getAction.results || results
            } else {
               Switch.onType<void>(type, {
                  Namespace: () => {
                     let collection = parent.children.observable
                     for (let i = 0; i < collection.length; ++i) {
                        //@ts-ignore
                        results.push(new IndexableItem<INamespace>(collection.at(i), i))
                     }
                  },
                  Model: () => {
                     let collection = parent.models.observable
                     for (let i = 0; i < collection.length; ++i) {
                        //@ts-ignore
                        results.push(new IndexableItem<IModel>(collection.at(i), i))
                     }
                  },
                  Instance: () => {
                     let collection = parent.instances.observable
                     for (let i = 0; i < collection.length; ++i) {
                        //@ts-ignore
                        results.push(new IndexableItem<IInstance>(collection.at(i), i))
                     }
                  }
               })
            }
         })
         .commit()

      return results
   }

   async reorder(source: IQualifiedObject, from: number, to: number): Promise<IQualifiedObject> {
      let action = Switch.case<IRfcAction>(source, {
         Namespace: (ns) => new NamespaceReorderAction(ns, from, to),
         Model: (model) => new ModelReorderAction(model, from, to),
         Instance: (inst) => new InstanceReorderAction(inst, from, to)
      })

      await this.rfc.create(action)
         .fulfill(async () => {
            return Switch.case(source, {
               Namespace: (ns) => {
                  //@ts-ignore
                  let collection = <NamespaceCollection>ns.parent.children
                  this._reorder<INamespace>(ns, collection, from, to, action)
               },
               Model: (model) => {
                  //@ts-ignore
                  let collection = <ModelCollection>ns.parent.models
                  this._reorder<IModel>(model, collection, from, to, action)
               },
               Instance: (inst) => {
                  //@ts-ignore
                  let collection = <InstanceCollection>ns.parent.children
                  this._reorder<IInstance>(inst, collection, from, to, action)
               }
            })
         })
         .commit()

      return source
   }

   async reorderMember(model: IModel, from: number, to: number): Promise<IMember> {
      let member = await model.members.at(from)

      if (member === undefined) {
         throw new Error(`A Member does not exist at that index (${from})`)
      }

      if (to < 0 || to >= (model.members.length + 1)) {
         throw new IndexOutOfRangeError(to, `The to index is out of range (${to}) for reodering a Member`)
      }

      this.rfc.create(new MemberReorderAction(member, from, to))
         .fulfill(async (action) => {
            let collection = model.members.observable

            collection.mutedMove(from, to, (change, move) => {
               emit([
                  { source: collection, event: ObservableEvents.moving, data: change },
                  { source: model.members, event: ObservableEvents.moving, data: change },
                  { source: model, event: Events.Model.MemberMoving, data: action },
                  { source: this.project, event: Events.Model.MemberMoving, data: action }
               ])

               move()

               emit([
                  { source: collection, event: ObservableEvents.moved, data: change },
                  { source: model.members, event: ObservableEvents.moved, data: change },
                  { source: model, event: Events.Model.MemberMoved, data: action },
                  { source: this.project, event: Events.Model.MemberMoved, data: action }
               ])
            })

            return
         })
         .commit()

      return member
   }

   async deleteMembers(model: IModel, names: string[]): Promise<IndexableItem<IMember>[]> {
      let collection = model.members.observable

      let actions = collection
         .filter(member => member.name in names)
         .map(m => new MemberDeleteAction(m))

      let results = actions.map(action => {
         //@ts-ignore
         return new IndexableItem<IMember>(action.source, collection.indexOf(action.source))
      })

      this.rfc.create(new BatchedActions(actions))
         .fulfill(async () => {
            collection.mutedRemove(actions.map(a => a.source), (change, remove) => {
               emit([
                  { source: collection, event: ObservableEvents.removing, data: change },
                  { source: model.members, event: ObservableEvents.removing, data: change },
                  { source: model, event: Events.Model.MemberRemoving, data: actions },
                  { source: this.project, event: Events.Model.MemberRemoving, data: actions }
               ])

               remove()

               emit([
                  { source: collection, event: ObservableEvents.removed, data: change },
                  { source: model.members, event: ObservableEvents.removed, data: change },
                  { source: model, event: Events.Model.MemberRemoved, data: actions },
                  { source: this.project, event: Events.Model.MemberRemoved, data: actions }
               ])
            })
         })
         .commit()

      return results
   }
}