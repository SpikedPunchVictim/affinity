import { IQualifiedObject, QualifiedObject } from "./QualifiedObject";
import { INamespace, Namespace } from "./Namespace";
import { Switch, QualifiedObjectType, as, sortByType } from "./utils/Types";
import { emit } from './utils/Eventing'
import { IProject, IProjectContext, IUidGenerator } from "./Project";
import { ArgumentError } from "../errors/ArgumentError";
import { NameCollisionError } from "../errors/NameCollisionError";
import { ParentChangeAction, QualifiedObjectGetAction } from "./actions/QualifiedObject";

import { ObservableCollection,
   NamespaceCollection,
   ObservableEvents,
   ModelCollection,
   InstanceCollection,
   MemberParameters,
   MemberCollection,
   FieldCollection } from "./collections";

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
   FieldCreateAction,
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
   InstanceGetAction} from "./actions";

import { Events } from "./Events";
import { IModel, Model } from "./Model";
import { IInstance, Instance } from "./Instance";
import { RfcError } from "../errors/RfcError";
import { IMember, Member } from "./Member";
import { Field, IField } from "./Field";
import { InvalidOperationError } from "../errors";
import { depthFirst } from "./utils/Search";
import { IValue, } from "./values/Value";
import { MemberValueChange, FieldValueChange } from "./values/Changes";
import { ChangeValueHandler } from "./values/ValueAttachment";
import { IndexableItem } from "./collections/ChangeSets";
import { QualifiedObjectCollection } from "./collections/QualifiedObjectCollection";

export interface IOrchestrator {
   createNamespace(parent: INamespace, name: string): Promise<INamespace>
   createModel(parent: INamespace, name: string): Promise<IModel>
   createInstance(parent: INamespace, model: IModel, name: string): Promise<IInstance>
   createMembers(model: IModel, params: MemberParameters | Array<MemberParameters>): Promise<Array<IMember>>
   createFields(instance: IInstance, members: IMember | Array<IMember>): Promise<Array<IField>>
   getQualifiedObjects<T extends IQualifiedObject>(type: QualifiedObjectType, parent: INamespace, indexes: number[] | undefined): Promise<IndexableItem<T>[] | undefined>
   delete<T extends IQualifiedObject>(item: T | T[]): Promise<boolean>
   rename(source: IQualifiedObject, newName: string): Promise<IQualifiedObject>
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

   private get uidGenerator(): IUidGenerator {
      return this.context.uidGenerator
   }
   
   constructor(project: IProject, context: IProjectContext) {
      this.project = project
      this.context = context
   }

   getAllChildren(parent: INamespace): Array<IQualifiedObject> {
      let results = new Array<IQualifiedObject>()

      for(let model of parent.models.toArray()) {
         results.push(model)
      }

      for(let inst of parent.instances.toArray()) {
         results.push(inst)
      }

      for(let ns of parent.children.toArray()) {
         results.push(...(this.getAllChildren(ns)))
      }

      return results
   }

   _getOwningCollection<T extends IQualifiedObject>(obj: IQualifiedObject): QualifiedObjectCollection<T> {
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

      collection.items.internalRemove(obj, (change, remove) => {
         // Cache off the parent
         let parent = obj.parent

         emit([
            { source: collection.items, event: ObservableEvents.removing, data: change},
            //@ts-ignore
            { source: parent, event: parentEvent.notifying, data: action },
            { source: this.project, event: parentEvent.notifying, data: action },
         ])

         changeHandlers?.before?.()

         remove()

         changeHandlers?.after?.()

         emit([
            { source: collection.items, event: ObservableEvents.removed, data: change},
            //@ts-ignore
            { source: parent, event: parentEvent.notified, data: action },
            { source: this.project, event: parentEvent.notified, data: action },
         ])
      })
   }

   _add<T extends IQualifiedObject>(obj: T, parent: INamespace, action: IRfcAction, changeHandlers?: PrePostChangeHandlers) {
      let parentEvent = Switch.case(obj, {
         Namespace: () => ({ notifying: Events.Namespace.ChildAdding, notified: Events.Namespace.ChildAdded }),
         Model: () => ({ notifying: Events.Namespace.ModelAdding, notified: Events.Namespace.ModelAdded }),
         Instance: () => ({ notifying: Events.Namespace.InstanceAdding, notified: Events.Namespace.InstanceAdded }),
      })

      let collection = Switch.case<QualifiedObjectCollection<T>>(obj, {
         //@ts-ignore
         Namespace: (ns) => parent.children,
         //@ts-ignore
         Model: (model) => parent.models,
         //@ts-ignore
         Instances: (inst) => parent.instances
      })
      
      collection.items.internalAdd(obj, (change, add) => {
         emit([
            { source: collection, event: ObservableEvents.adding, data: change },
            //@ts-ignore
            { source: obj.parent, event: parentEvent.notifying, data: action },
            { source: this.project, event: parentEvent.notifying, data: action }
         ])

         changeHandlers?.before?.()

         add()

         changeHandlers?.after?.()

         emit([
            { source: collection, event: ObservableEvents.added, data: change },
            //@ts-ignore
            { source: obj.parent, event: parentEvent.notified, data: action },
            { source: this.project, event: parentEvent.notified, data: action  }
         ])
      })
   }


   _reorder<T extends IQualifiedObject>(
      source: T,
      collection: ObservableCollection<T>,   // The collection source lives in
      from: number,
      to: number,
      action: IRfcAction,
      changeHandlers?: PrePostChangeHandlers): void {
         let parentChange = Switch.case(source, {
            Namespace: (ns) => ({ notifying: Events.Namespace.ChildMoving, notified: Events.Namespace.ChildMoved }),
            Model: (model) => ({ notifying: Events.Namespace.ModelMoving, notified: Events.Namespace.ModelMoved }),
            Instance: (inst) => ({ notifying: Events.Namespace.InstanceMoving, notified: Events.Namespace.InstanceMoved})
         })

         collection.internalMove(from, to, (change, move) => {
            emit([
               { source: collection, event: ObservableEvents.moving, data: change },
               //@ts-ignore
               { source: source.parent, event: parentChange.notifying, data: action },
               { source: this.project, event: parentChange.notifying, data: action }
            ])

            changeHandlers?.before?.()

            move()

            changeHandlers?.after?.()

            emit([
               { source: collection, event: ObservableEvents.moved, data: change },
               //@ts-ignore
               { source: source.parent, event: parentChange.notified, data: action },
               { source: this.project, event: parentChange.notified, data: action }
            ])
         })
      }

   async delete(items: IQualifiedObject | IQualifiedObject[]): Promise<boolean> {
      if(!Array.isArray(items)) {
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
      for(let item of items) {
         Switch.case(item, {
            Namespace: (ns) => {
               depthFirst<IQualifiedObject>(ns, obj => {
                  let results = new Array<IQualifiedObject>()

                  Switch.case(obj, {
                     Namespace: async (namespace) => {
                        for await(let child of namespace.children) {
                           results.push(child)
                        }
      
                        for await(let model of namespace.models) {
                           results.push(model)
                        }
      
                        for await(let inst of namespace.instances) {
                           results.push(inst)
                        }
                     },
                     Model: () => {},
                     Instance: () => {}
                  })

                  return results
               }, obj => actions.set(obj, generateAction(obj)))
            },
            Model: (obj) => {
               if(actions.get(item) !== undefined) {
                  return
               }

               let act = generateAction(item)
               actions.set(item, act)
            },
            Instance: (obj) => {
               if(actions.get(item) !== undefined) {
                  return
               }

               let act = generateAction(item)
               actions.set(item, act)
            }
         })
      }

      let act = new BatchedActions(Array.from(actions.values()))

      // Are all parents valid?
      for(let item of actions.keys()) {
         if(item.parent == null) {
            throw new InvalidOperationError(`One of the items being deleted does not have a valid parent: ${item.qualifiedName}`)
         }
      }
      
      //@ts-ignore
      await this.rfc.create(act)
         .fulfill(async (action) => {
            //@ts-ignore
            for(let item of actions.keys()) {
               let action = actions.get(item)

               //@ts-ignore
               this._remove(item, action, { after: () => as<QualifiedObject>(obj).orphan() })
            }
         })
         .commit()

         return true
   }

   async createNamespace(parent: INamespace, name: string): Promise<INamespace> {
      let namespace = new Namespace(await this.uidGenerator.generate(), parent, name, this.context)

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
      let model = new Model(await this.uidGenerator.generate(), parent, name, this.context)

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
      let instance = new Instance(await this.uidGenerator.generate(), parent, model, name, this.context)

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

   async createMembers(model: IModel, params: MemberParameters | Array<MemberParameters>): Promise<Array<IMember>> {
      if(!Array.isArray(params)) {
         params = [params]
      }

      let members = new Array<IMember>()
      let actions = new Array<MemberCreateAction>()

      for(let param of params) {
         let member = new Member(model, param.name, param.value, this)
         members.push(member)
         actions.push(new MemberCreateAction(member))
      }

      await this.rfc.create(new BatchedActions(actions))
         .fulfill(async (action) => {
            let collection = <MemberCollection>model.members

            collection.internalAdd(members, (change, add) => {
               emit([
                  { source: collection, event: ObservableEvents.adding, data: change },
                  { source: collection.model, event: Events.Model.MemberAdding, data: action },
                  { source: this.project, event: Events.Model.MemberAdding, data: action }
               ])

               add()

               emit([
                  { source: collection, event: ObservableEvents.added, data: change },
                  { source: collection.model, event: Events.Model.MemberAdded, data: action },
                  { source: this.project, event: Events.Model.MemberAdded, data: action  }
               ])
            })
         })
         .reject(async (action: IRfcAction, err?: Error) => {
            throw new RfcError(action, err)
         })
         .commit()

      return members
   }

   async createFields(instance: IInstance, members: IMember | Array<IMember>): Promise<Array<IField>> {
      if(!Array.isArray(members)) {
         members = [members]
      }

      let fields = new Array<IField>()
      let actions = new Array<FieldCreateAction>()

      for(let member of members) {
         let field = new Field(instance, member, member.value.clone())
         fields.push(field)
         actions.push(new FieldCreateAction(field))
      }

      await this.rfc.create(new BatchedActions(actions))
         .fulfill(async (action) => {
            let collection = <FieldCollection>(instance.fields)

            collection.internalAdd(fields, (change, add) => {
               emit([
                  { source: collection, event: ObservableEvents.adding, data: change },
                  { source: collection.parent, event: Events.Instance.FieldAdding, data: action },
                  { source: this.project, event: Events.Instance.FieldAdding, data: action }
               ])

               add()

               emit([
                  { source: collection, event: ObservableEvents.added, data: change },
                  { source: collection.parent, event: Events.Instance.FieldAdded, data: action },
                  { source: this.project, event: Events.Instance.FieldAdded, data: action  }
               ])
            })
         })
         .reject(async (action: IRfcAction, err?: Error) => {
            throw new RfcError(action, err)
         })
      .commit()

      return fields
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
            source.emit(Events.QualifiedObjectEvents.NameChanging, action)
            qobj.setName(newName)
            source.emit(Events.QualifiedObjectEvents.NameChanged, action)
            return
         })
         .commit()

      return source
   }

   async move(source: IQualifiedObject, to: INamespace): Promise<IQualifiedObject> {
      if(source == null) {
         throw new ArgumentError(`source must be valid`)
      }

      if(source === this.project.root) {
         throw new ArgumentError(`Cannot move the Root namespace`)
      }

      if(source.parent == null) {
         throw new ArgumentError(`The source does not belong to any Namespace. Ensure that it exists in the project.`)
      }

      if(source.parent === to) {
         return Promise.resolve(source)
      }

      let found = await this.project.get(QualifiedObjectType.Namespace, to.qualifiedName)
      
      if(!found) {
         throw new ArgumentError(`The 'to' Namespace provided to move() doesn't exist in this project`)
      }

      // Is there a QualifiedObject with that name already at the destination?
      let exists = Switch.case<boolean>(source, {
         Namespace: obj => to.children.get(source.name) !== undefined,
         Model: obj => to.models.get(source.name) !== undefined,
         Instance: obj => to.instances.get(source.name) !== undefined
      })

      if(exists) {
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
               } catch(err) {
                  if(hasRemoved) {
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

   async getQualifiedObjects<T extends IQualifiedObject>(type: QualifiedObjectType, parent: INamespace, indexes: number[] | undefined): Promise<IndexableItem<T>[] | undefined> {
      let action = Switch.onType<IRfcAction>(type, {
         Namespace: () => new NamespaceGetAction(parent, indexes),
         Model: () => new ModelGetAction(parent, indexes),
         Instance: () => new InstanceGetAction(parent, indexes)
      })

      let results: Array<IndexableItem<T>> | undefined = undefined

      await this.rfc.create(action)
         .fulfill(async () => {
            let getAction = <QualifiedObjectGetAction<T>>action
            results = getAction.results === undefined ? undefined : getAction.results
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
                  this._reorder<INamespace>(ns, collection.items, from, to, action)
               },
               Model: (model) => {
                  //@ts-ignore
                  let collection = <ModelCollection>ns.parent.models
                  this._reorder<IModel>(model, collection.items, from, to, action)
               },
               Instance: (inst) => {
                  //@ts-ignore
                  let collection = <InstanceCollection>ns.parent.children
                  this._reorder<IInstance>(inst, collection.items, from, to, action)
               }
            })
         })
         .commit()

      return source
   }
}