import { INamespace } from "../Namespace"
import { IQualifiedObject, QualifiedObject } from "../QualifiedObject"
import { Switch, sortByType, QualifiedObjectType, as } from "../utils/Types"
import { IQualifiedObjectCollection } from "../collections/QualifiedObjectCollection"
import { IRfcAction, BatchedActions, ReorderAction } from "../actions/Actions"
import { Events } from "../Events"
import { emit } from "../utils/Eventing"
import { ItemAdd } from "../collections/ChangeSets"
import { ObservableEvents } from "../collections/ObservableCollection"
import { IProject } from "../.."
import { IProjectContext } from "../Project"
import { IRequestForChangeSource } from "../actions/RequestForChange"
import { NamespaceDeleteAction, NamespaceCreateAction, NamespaceGetChildrenAction, NamespaceMoveAction, NamespaceRenameAction, NamespaceReorderAction, NamespaceUpdateAction } from '../actions/Namespace'
import { ModelDeleteAction, ModelCreateAction, ModelRenameAction, ModelMoveAction, ModelGetChildrenAction, ModelReorderAction, ModelUpdateAction } from '../actions/Model'
import { InstanceDeleteAction, InstanceRenameAction, InstanceMoveAction, InstanceGetChildrenAction, InstanceCreateAction, InstanceReorderAction, InstanceUpdateAction } from '../actions/Instance'
import { InvalidOperationError } from "../../errors/InvalidOperationError"
import { IOrchestrator } from "./Orchestrator"
import { NameCollisionError } from "../../errors/NameCollisionError"
import { IUidWarden } from "../UidWarden"
import { Search } from "../Search"

/*

composer
   .request(new MemberDeleteAction(member))

composer.sync(master, other
   
composer.delete


*/

type ChangeHandler = () => void

type PrePostChangeHandlers = {
   before?: ChangeHandler
   after?: ChangeHandler
}

export class ComposerAction {
   create<T extends IQualifiedObject>(obj: T, index: number): IRfcAction {
      return Switch.case(obj, {
         //@ts-ignore
         Namespace: (ns) => new NamespaceCreateAction(ns, index),
         //@ts-ignore
         Model: (model) => new ModelCreateAction(model, index),
         //@ts-ignore
         Instance: (inst) => new InstanceCreateAction(inst, index)
      })
   }

   delete<T extends IQualifiedObject>(obj: T): IRfcAction {
      return Switch.case(obj, {
         //@ts-ignore
         Namespace: (ns) => new NamespaceDeleteAction(ns),
         //@ts-ignore
         Model: (model) => new ModelDeleteAction(model),
         //@ts-ignore
         Instance: (inst) => new InstanceDeleteAction(inst)
      })
   }

   getChildren(type: QualifiedObjectType, parent: INamespace): IRfcAction {
      return Switch.onType(type, {
         //@ts-ignore
         Namespace: (ns) => new NamespaceGetChildrenAction(parent),
         //@ts-ignore
         Model: (model) => new ModelGetChildrenAction(parent),
         //@ts-ignore
         Instance: (inst) => new InstanceGetChildrenAction(parent)
      })
   }

   move<T extends IQualifiedObject>(obj: T, to: INamespace): IRfcAction {
      return Switch.case(obj, {
         //@ts-ignore
         Namespace: (ns) => new NamespaceMoveAction(ns, ns.parent, to),
         //@ts-ignore
         Model: (model) => new ModelMoveAction(model, model.parent, to),
         //@ts-ignore
         Instance: (inst) => new InstanceMoveAction(inst, inst.parent, to)
      })
   }

   rename<T extends IQualifiedObject>(obj: T, newName: string): IRfcAction {
      return Switch.case(obj, {
         //@ts-ignore
         Namespace: (ns) => new NamespaceRenameAction(ns, ns.name, newName),
         //@ts-ignore
         Model: (model) => new ModelRenameAction(model, model.name, newName),
         //@ts-ignore
         Instance: (inst) => new InstanceRenameAction(inst, inst.name, newName)
      })
   }

   reorder<T extends IQualifiedObject>(obj: T, from: number, to: number): ReorderAction<T> {
      return Switch.case(obj, {
         //@ts-ignore
         Namespace: (ns) => new NamespaceReorderAction(ns, from, to),
         //@ts-ignore
         Model: (model) => new ModelReorderAction(model, from, to),
         //@ts-ignore
         Instance: (inst) => new InstanceReorderAction(inst, from, to)
      })
   }

   update<T extends IQualifiedObject>(obj: T): IRfcAction {
      return Switch.case(obj, {
         //@ts-ignore
         Namespace: (ns) => new NamespaceUpdateAction(ns),
         //@ts-ignore
         Model: (model) => new ModelUpdateAction(model),
         //@ts-ignore
         Instance: (inst) => new InstanceUpdateAction(inst)
      })
   }
}

export class Composer {
   readonly project: IProject
   readonly context: IProjectContext
   readonly action: ComposerAction

   get rfc(): IRequestForChangeSource {
      return this.context.rfc
   }

   get orchestrator(): IOrchestrator {
      return this.context.orchestrator
   }

   get uidWarden(): IUidWarden {
      return this.context.uidWarden
   }

   get search(): Search {
      return this.context.search
   }

   constructor(project: IProject, context: IProjectContext) {
      this.project = project
      this.context = context
      this.action = new ComposerAction()
   }

   getAllChildren(parent: INamespace): Array<IQualifiedObject> {
      let results = new Array<IQualifiedObject>()

      for (let model of parent.models.toArray()) {
         results.push(model)
      }

      for (let inst of parent.instances.toArray()) {
         results.push(inst)
      }

      let children = parent.children.toArray()
      results.push(...children)

      for (let child of children) {
         results.push(...(this.getAllChildren(child)))
      }

      return results
   }

   getOwningCollection<T extends IQualifiedObject>(obj: IQualifiedObject): IQualifiedObjectCollection<T> {
      return Switch.case(obj, {
         //@ts-ignore
         Namespace: (ns) => ns.parent.children,
         //@ts-ignore
         Model: (model) => model.parent.models,
         //@ts-ignore
         Instance: (inst) => inst.parent.instances
      })
   }

   getIndex(obj: IQualifiedObject): number | undefined {
      return Switch.case(obj, {
         Namespace: (ns) => ns.parent?.children.observable.findIndex(n => n.id === obj.id),
         Model: (model) => model.parent?.models.observable.findIndex(m => m.id === obj.id),
         Instance: (inst) => inst.parent?.instances.observable.findIndex(int => int.id === obj.id)
      })
   }

   remove<T extends IQualifiedObject>(obj: T, action: IRfcAction, changeHandlers?: PrePostChangeHandlers): void {
      let parentEvent = Switch.case(obj, {
         Namespace: () => ({ notifying: Events.Namespace.ChildRemoving, notified: Events.Namespace.ChildRemoved }),
         Model: () => ({ notifying: Events.Namespace.ModelRemoving, notified: Events.Namespace.ModelRemoved }),
         Instance: () => ({ notifying: Events.Namespace.InstanceRemoving, notified: Events.Namespace.InstanceRemoved }),
      })

      let collection = this.getOwningCollection(obj)

      collection.observable.customRemove(obj, (change, remove) => {
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

   add<T extends IQualifiedObject>(
      obj: T,
      parent: INamespace,
      index: number,
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

      collection.observable.customAdd(obj, (change, add) => {
         let ch = [new ItemAdd<T>(obj, index)]

         emit([
            { source: collection.observable, event: ObservableEvents.adding, data: change },
            { source: collection, event: ObservableEvents.adding, data: change },
            //@ts-ignore
            { source: parent, event: parentEvent.notifying, data: action },
            { source: this.project, event: parentEvent.notifying, data: action }
         ])

         changeHandlers?.before?.()

         add(ch)

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

   reorder<T extends IQualifiedObject>(
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

      collection.observable.customMove(from, to, (change, move) => {
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

   async move<T extends IQualifiedObject>(source: T, newParent: INamespace, index: number, action: IRfcAction): Promise<void> {
      let exists = await Switch.case(source, {
         Namespace: async () => {
            let found = await newParent.children.get(source.name)
            return found !== undefined
         },
         Model: async () => {
            let found = await newParent.models.get(source.name)
            return found !== undefined
         },
         Instance: async () => {
            let found = await newParent.instances.get(source.name)
            return found !== undefined
         }
      })

      if (exists) {
         throw new NameCollisionError(`A QualifiedObject with that name already exists in the target location`)
      }      
      
      let hasRemoved = false
      let originalIndex = await this.getOwningCollection(source).indexOf(source)
      let originalParent = source.parent
      
      try {
         this.remove(source, action)
         hasRemoved = true
         this.add(source, newParent, index, action, { after: () => as<QualifiedObject>(source).setParent(newParent) })
      } catch (err) {
         if (hasRemoved) {
            // Recover from a failure
            //@ts-ignore
            this.add(source, originalParent, originalIndex, action)
         }

         throw err
      }
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
         // Filter duplicates
         if (actions.get(item) !== undefined) {
            continue
         }

         let action = this.action.delete(item)
         actions.set(item, action)
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
               this.remove(item, action, { after: () => as<QualifiedObject>(obj).orphan() })
            }
         })
         .commit()

      return true
   }
}