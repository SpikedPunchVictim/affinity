import { IQualifiedObject, QualifiedObject } from "./QualifiedObject";
import { INamespace, Namespace } from "./Namespace";
import { Switch, QualifiedObjectType, as, asCollection, sortByType } from "./utils/Types";
import { emit } from './utils/Eventing'
import { IProject, IProjectContext } from "./Project";
import { ArgumentError } from "../errors/ArgumentError";
import { NameCollisionError } from "../errors/NameCollisionError";
import { ParentChangeAction } from "./actions/QualifiedObject";

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
   FieldValueChangeAction} from "./actions";


import { Events } from "./Events";
import { IModel, Model } from "./Model";
import { IInstance, Instance } from "./Instance";
import { RfcError } from "../errors/RfcError";
import { IMember, Member } from "./Member";
import { Field, IField } from "./Field";
import { InvalidOperationError } from "../errors";
import { depthFirst } from "./utils/Search";
import { IValue, MemberValueChange, FieldValueChange } from "./values/Value";
import { ChangeValueHandler } from "./values/ValueFactory";

export interface IOrchestrator {
   createNamespace(parent: INamespace, name: string): Promise<INamespace>
   createModel(parent: INamespace, name: string): Promise<IModel>
   createInstance(parent: INamespace, model: IModel, name: string): Promise<IInstance>
   createMembers(model: IModel, params: MemberParameters | Array<MemberParameters>): Promise<Array<IMember>>
   createFields(instance: IInstance, members: IMember | Array<IMember>): Promise<Array<IField>>
   delete<T extends IQualifiedObject>(item: T | T[]): Promise<boolean>
   rename(source: IQualifiedObject, newName: string): Promise<IQualifiedObject>
   move(source: IQualifiedObject, to: INamespace): Promise<IQualifiedObject>
   updateMemberValue(member: IMember, oldValue: IValue, newValue: IValue, changeValue: ChangeValueHandler): Promise<IValue>
   updateFieldValue(field: IField, oldValue: IValue, newValue: IValue, changeValue: ChangeValueHandler): Promise<IValue>
}

export class Orchestrator implements IOrchestrator {
   readonly project: IProject
   readonly context: IProjectContext

   private get rfc() {
      return this.project.rfc
   }
   
   constructor(project: IProject, context: IProjectContext) {
      this.project = project
      this.context = context
   }

   getAllChildren(parent: INamespace): Array<IQualifiedObject> {
      let results = new Array<IQualifiedObject>()

      for(let model of parent.models) {
         results.push(model)
      }

      for(let inst of parent.instances) {
         results.push(inst)
      }

      for(let ns of parent.children) {
         results.push(...(this.getAllChildren(ns)))
      }

      return results
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
                     Namespace: (namespace) => {
                        for(let child of namespace.children) {
                           results.push(child)
                        }
      
                        for(let model of namespace.models) {
                           results.push(model)
                        }
      
                        for(let inst of namespace.instances) {
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

      let remove = <T extends IQualifiedObject, TCollection extends ObservableCollection<T>>(obj: T, collection: TCollection): void => {
         let action = actions.get(obj)

         let parentEvent = Switch.case(obj, {
            Namespace: () => ({ notifying: Events.Namespace.ChildRemoving, notified: Events.Namespace.ChildRemoved }),
            Model: () => ({ notifying: Events.Namespace.ModelRemoving, notified: Events.Namespace.ModelRemoved }),
            Instance: () => ({ notifying: Events.Namespace.InstanceRemoving, notified: Events.Namespace.InstanceRemoved }),
         })

         collection.internalRemove(obj, (change, remve) => {
            // Cache off the parent
            let parent = obj.parent

            emit([
               { source: collection, event: ObservableEvents.removing, data: change},
               //@ts-ignore
               { source: parent, event: parentEvent.notifying, data: action },
               { source: this.project, event: parentEvent.notifying, data: action },
            ])

            remve()

            as<QualifiedObject>(obj).orphan()

            emit([
               { source: collection, event: ObservableEvents.removed, data: change},
               //@ts-ignore
               { source: parent, event: parentEvent.notified, data: action },
               { source: this.project, event: parentEvent.notified, data: action },
            ])
         })
      }
      
      //@ts-ignore
      await this.rfc.create(act)
         .fulfill(async (action) => {
            //@ts-ignore
            for(let item of actions.keys()) {
               let parent = item.parent

               Switch.case(item, {
                  Namespace: (it) => remove<INamespace, NamespaceCollection>(it, <NamespaceCollection>parent?.children),
                  Model: (it) => remove<IModel, ModelCollection>(it, <ModelCollection>parent?.models),
                  Instance: (it) => remove<IInstance, InstanceCollection>(it, <InstanceCollection>parent?.instances)
               })
            }
         })
         .commit()

         return true
   }

   async createNamespace(parent: INamespace, name: string): Promise<INamespace> {
      let namespace = new Namespace(parent, name, this.context)
      let children = asCollection<INamespace, NamespaceCollection>(parent.children)

      await this.rfc.create(new NamespaceCreateAction(namespace))
         .fulfill(async (action) => {
            children.internalAdd(namespace, (change, add) => {
               emit([
                  { source: children, event: ObservableEvents.adding, data: change },
                  { source: parent, event: Events.Namespace.ChildAdding, data: action },
                  { source: this.project, event: Events.Namespace.ChildAdding, data: action }
               ])
      
               add()
      
               emit([
                  { source: children, event: ObservableEvents.added, data: change },
                  { source: parent, event: Events.Namespace.ChildAdded, data: action },
                  { source: this.project, event: Events.Namespace.ChildAdded, data: action  }
               ])
            })
         })
         .reject(async (action: IRfcAction, err?: Error) => {
            throw new RfcError(action, err)
         })
         .commit()

      return namespace
   }

   async createModel(parent: INamespace, name: string): Promise<IModel> {
      let model = new Model(parent, name, this.context)
      let children = asCollection<IModel, ModelCollection>(parent.models)

      await this.rfc.create(new ModelCreateAction(model))
         .fulfill(async (action) => {
            children.internalAdd(model, (change, add) => {
               emit([
                  { source: children, event: ObservableEvents.adding, data: change },
                  { source: parent, event: Events.Namespace.ModelAdding, data: action },
                  { source: this.project, event: Events.Namespace.ModelAdding, data: action }
               ])
      
               add()
      
               emit([
                  { source: children, event: ObservableEvents.added, data: change },
                  { source: parent, event: Events.Namespace.ModelAdded, data: action },
                  { source: this.project, event: Events.Namespace.ModelAdded, data: action  }
               ])
            })
         })
         .reject(async (action: IRfcAction, err?: Error) => {
            throw new RfcError(action, err)
         })
         .commit()

      return model
   }

   async createInstance(parent: INamespace, model: IModel, name: string): Promise<IInstance> {
      let instance = new Instance(parent, model, name, this.context)

      await this.rfc.create(new InstanceCreateAction(instance))
         .fulfill(async (action) => {
            let children = asCollection<IInstance, InstanceCollection>(parent.instances)

            children.internalAdd(instance, (change, add) => {
               emit([
                  { source: children, event: ObservableEvents.adding, data: change },
                  { source: parent, event: Events.Namespace.InstanceAdding, data: action },
                  { source: this.project, event: Events.Namespace.InstanceAdding, data: action }
               ])

               add()

               emit([
                  { source: children, event: ObservableEvents.added, data: change },
                  { source: parent, event: Events.Namespace.InstanceAdded, data: action },
                  { source: this.project, event: Events.Namespace.InstanceAdded, data: action  }
               ])
            })
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
            let collection = asCollection<IMember, MemberCollection>(model.members)

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
            let collection = asCollection<IField, FieldCollection>(instance.fields)

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
            let remove = <T extends IQualifiedObject>(
               src: T,
               from: ObservableCollection<T>,
               removingEvent: string,
               removedEvent: string
            ) => {
               from.internalRemove(src, (change, remove) => {
                  emit([
                     { source: from, event: ObservableEvents.removing, data: change },
                     //@ts-ignore
                     { source: src.parent, event: removingEvent, data: action }
                  ])

                  remove()

                  emit([
                     { source: from, event: ObservableEvents.removed, data: change },
                     //@ts-ignore
                     { source: src.parent, event: removedEvent, data: action }
                  ])
               })
            }

            let add = <T extends IQualifiedObject>(
               src: T,
               newParent: INamespace,
               toCollection: ObservableCollection<T>,
               addingEvent: string,
               addedEvent: string
            ) => {

               toCollection.internalAdd(src, (change, add) => {
                  emit([
                     { source: toCollection, event: ObservableEvents.adding, data: change },
                     //@ts-ignore
                     { source: src.parent, event: addingEvent, data: action }
                  ])

                  add()

                  as<QualifiedObject>(src).setParent(newParent)

                  emit([
                     { source: toCollection, event: ObservableEvents.added, data: change },
                     //@ts-ignore
                     { source: src.parent, event: addedEvent, data: action }
                  ])
               })
            }

            let performMove = <T extends IQualifiedObject>(
               source: T,
               newParent: INamespace,
               fromCollection: ObservableCollection<T>,
               toCollection: ObservableCollection<T>,
               removing: string,
               removed: string,
               adding: string,
               added: string
            ) => {
               let hasRemoved = false
               try {
                  //@ts-ignore
                  remove(source, fromCollection, removing, removed)
                  hasRemoved = true
                  add<T>(source, newParent, toCollection, adding, added)
               } catch(err) {
                  if(hasRemoved) {
                     // Recover from a failure
                     //@ts-ignore
                     add(source, source.parents, adding, added)
                  }

                  throw err
               }
            }

            Switch.case(source, {
               Namespace: (obj) => {
                  performMove(
                     obj,
                     to,
                     //@ts-ignore
                     asCollection<INamespace, ObservableCollection<INamespace>>(source.parent.children),
                     asCollection<INamespace, ObservableCollection<INamespace>>(to.children),
                     Events.Namespace.ChildRemoving,
                     Events.Namespace.ChildRemoved,
                     Events.Namespace.ChildAdding,
                     Events.Namespace.ChildAdded
                  )
               },
               Model: (obj) => {
                  performMove(
                     obj,
                     to,
                     //@ts-ignore
                     asCollection<IModel, ObservableCollection<IModel>>(source.parent.models),
                     asCollection<IModel, ObservableCollection<IModel>>(to.models),
                     Events.Namespace.ModelRemoving,
                     Events.Namespace.ModelRemoved,
                     Events.Namespace.ModelAdding,
                     Events.Namespace.ModelAdded
                  )
               },
               Instance: (obj) => {
                  performMove<IInstance>(
                     obj,
                     to,
                     //@ts-ignore
                     asCollection<IInstance, ObservableCollection<IInstance>>(source.parent.instances),
                     asCollection<IInstance, ObservableCollection<IInstance>>(to.instances),
                     Events.Namespace.InstanceRemoving,
                     Events.Namespace.InstanceRemoved,
                     Events.Namespace.InstanceAdding,
                     Events.Namespace.InstanceAdded
                  )
               }
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
               { source: field.instance, event: Events.Model.ValueChanging, data: change },
               { source: this.project, event: Events.Model.ValueChanging, data: change }
            ])
      
            updatedValue = changeValue()
      
            emit([
               { source: field, event: Events.Member.ValueChanged, data: change },
               { source: field.instance, event: Events.Model.ValueChanged, data: change },
               { source: this.project, event: Events.Model.ValueChanged, data: change }
            ])
         })
         .commit()

      //@ts-ignore
      return updatedValue
   }
}