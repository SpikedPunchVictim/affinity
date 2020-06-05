import { IProject, IProjectContext } from "../Project";
import { syncToMasterAsync, syncToMaster } from "../utils/Collections";
import { IObservableCollection, ObservableCollection, ObservableEvents } from "../collections/ObservableCollection";
import { INamespace } from "../..";
import { NamespaceLazyRestoreInfo, Namespace, NamespaceFullRestoreInfo } from "../Namespace";
import { QualifiedObjectType, Switch } from "../utils/Types";
import { IUidWarden } from "../UidWarden";
import { Search } from "../Search";
import { Composer } from "./Composer";
import { emit } from "../utils/Eventing";
import { Events } from "../Events";
import { ModelLazyRestoreInfo, IModel, Model, ModelFullRestoreInfo } from "../Model";
import { IQualifiedObject, QualifiedObject } from "../QualifiedObject";
import { InstanceLazyRestoreInfo, IInstance, Instance, InstanceFullRestoreInfo } from "../Instance";
import { RestoreInfo } from '../Restore'
import { MemberRestoreInfo, IMember, Member } from "../Member";
import { Value } from "../values/Value";
import { IOrchestrator } from "./Orchestrator";
import { ItemAdd, ItemRemove } from "../collections/ChangeSets";
import { FieldRestoreInfo, IField, FieldAttachment, Field } from "../Field";


export class Restore {
   readonly project: IProject
   readonly context: IProjectContext
   readonly composer: Composer

   get uidWarden(): IUidWarden {
      return this.context.uidWarden
   }

   get search(): Search {
      return this.context.search
   }

   get orchestrator(): IOrchestrator {
      return this.context.orchestrator
   }

   constructor(project: IProject, context: IProjectContext, composer: Composer) {
      this.project = project
      this.context = context
      this.composer = composer
   }

   private async qualifiedObject(object: IQualifiedObject, restore: RestoreInfo): Promise<void> {
      let obj = object as QualifiedObject

      if (restore.id !== obj.id) {
         throw new Error(`Restore information does not represent the same object being updated. Source ID: ${obj.id}   Restore ID: ${restore.id}`)
      }

      obj.internalSetName(restore.name)

      let parent = await this.project.getById<INamespace>(QualifiedObjectType.Namespace, restore.parentId)

      if (parent === undefined) {
         throw new Error(`Failed to retrieve the parent Namespace when restoring a Namespace`)
      }

      // Does it need to be moved?
      if (obj.parent == null) {
         // Has no Parent (no idea how we would get here)
         // TODO: Revisit this action type here
         let action = this.composer.action.create(obj, restore.index)
         this.composer.add(obj, parent, restore.index, action)
      } else if (parent.id !== obj.parent.id) {
         let action = this.composer.action.move(obj, parent)
         this.composer.move(obj, parent, restore.index, action)
      } else {
         // Does it need to be reordered?
         let currentIndex = this.composer.getIndex(object)

         if (currentIndex && currentIndex !== restore.index) {
            let action = this.composer.action.reorder(obj, currentIndex, restore.index)
            let collection = this.composer.getOwningCollection(obj)
            this.composer.reorder(obj, collection, action.from, action.to, action)
         }
      }
   }

   /**
    * Restores an already existing Namespace
    * 
    * @param namespace The Namespace to restore
    * @param restore The restore information
    */
   async namespace(namespace: INamespace, restore: NamespaceLazyRestoreInfo | NamespaceFullRestoreInfo): Promise<void> {
      await this.qualifiedObject(namespace, restore)

      let isFullRestore = (restore instanceof NamespaceFullRestoreInfo)

      if (!isFullRestore) {
         // We're done
         return
      }

      let full = restore as NamespaceFullRestoreInfo

      try {

         // Update the Namespace collections
         await this.collection<INamespace, NamespaceLazyRestoreInfo>(
            namespace,
            namespace.namespaces.observable,
            new ObservableCollection(...full.namespaces),
            async (restore) => new Namespace(restore.name, namespace, this.context, restore.id))

         await this.collection<IModel, ModelLazyRestoreInfo>(
            namespace,
            namespace.models.observable,
            new ObservableCollection(...full.models),
            async (restore: ModelLazyRestoreInfo) => new Model(restore.name, namespace, this.context, restore.id))

         await this.collection<IInstance, InstanceLazyRestoreInfo>(
            namespace,
            namespace.instances.observable,
            new ObservableCollection(...full.instances),
            async (restore) => {
               let model = await this.project.getById<IModel>(QualifiedObjectType.Model, restore.modelId)
               return new Instance(restore.name, namespace, model, this.context, restore.id)
            })

      } catch (err) {
         console.error(err)
      }
   }

   /**
    * Restores an Instance's Fields
    * 
    * @param instance The Instance contianing the Fields
    * @param restore The restore info
    */
   async instance(instance: IInstance, restore: InstanceLazyRestoreInfo | InstanceFullRestoreInfo): Promise<void> {
      await this.qualifiedObject(instance, restore)

      let isFullRestore = restore instanceof InstanceFullRestoreInfo

      if (!isFullRestore) {
         return
      }

      let full = restore as InstanceFullRestoreInfo

      this.fields(instance, full.fields)
   }

   /**
    * Restores an Instance's Fields
    * 
    * @param instance The Instance containing the Fields
    * @param restore The restore info
    */
   fields(instance: IInstance, restore: FieldRestoreInfo[]): void {
      syncToMaster(
         new ObservableCollection(...restore),
         instance.fields.observable,
         {
            equal: (master: FieldRestoreInfo, other: IField): boolean => {
               if(master.id !== other.id) {
                  return false
               }

               let field = other as Field

               if(master.attached !== other.attachment) {
                  if(master.attached === FieldAttachment.Attached) {
                     field.internalSetAttachment(master.attached)
                     field.internalSetValue(master.value)
                  } else {
                     field.internalSetAttachment(master.attached)
                  }
               }

               if(!master.value.equals(other.value)) {
                  field.internalSetValue(master.value)
               }

               return true
            },
            add: (master: FieldRestoreInfo, index: number, collection: IObservableCollection<IField>): void => {
               // Fields are added when Members are updated
            },
            remove: (other: IField, index: number, collection: IObservableCollection<IField>): void => {
               // Fields are removed when Members are updated
            },
            move: (other, from: number, to: number, collection: IObservableCollection<IField>): void => {
               // Fields are moved when Members are updated
            }
         }
      )
   }

   /**
    * Restores a Model
    * 
    * @param model The Model to restore
    * @param restore The Restore Info
    */
   async model(model: IModel, restore: ModelLazyRestoreInfo | ModelFullRestoreInfo): Promise<void> {
      await this.qualifiedObject(model, restore)

      let isFullRestore = restore instanceof ModelFullRestoreInfo

      if (!isFullRestore) {
         return
      }

      let full = restore as ModelFullRestoreInfo

      this.members(model, full.members)
   }

   /**
    * Restores a Model's Members
    * 
    * @param model The Model whose Members will be updated
    * @param restore Member restore info
    */
   members(model: IModel, restore: MemberRestoreInfo[]): void {
      syncToMaster(
         new ObservableCollection(...restore),
         model.members.observable,
         {
            equal: (master: MemberRestoreInfo, other: IMember): boolean => {
               if (master.id !== other.id) {
                  return false
               }

               if (master.name !== other.name) {
                  let member = other as Member
                  member.setName(master.name)
               }

               if (!master.value.equals(other.value)) {
                  let val = other.value as Value
                  val.internalSet(master.value)
               }

               return true
            },
            add: (master: MemberRestoreInfo, index: number, collection: IObservableCollection<IMember>): void => {
               let member = this.composer.create.member(model, master.name, master.value, master.id)

               collection.customAdd(member, (change, add) => {
                  let action = this.composer.action.createMember(model, member, index)

                  emit([
                     { source: collection, event: ObservableEvents.adding, data: change },
                     { source: model.members, event: ObservableEvents.adding, data: change },
                     { source: model, event: Events.Model.MemberAdding, data: action },
                     { source: this.project, event: Events.Model.MemberAdding, data: action }
                  ])

                  let updatedChange = new ItemAdd<IMember>(member, index)
                  add([updatedChange])

                  emit([
                     { source: collection, event: ObservableEvents.added, data: change },
                     { source: model.members, event: ObservableEvents.added, data: change },
                     { source: model, event: Events.Model.MemberAdded, data: action },
                     { source: this.project, event: Events.Model.MemberAdded, data: action }
                  ])
               })
            },
            remove: (other: IMember, index: number, collection: IObservableCollection<IMember>): void => {
               collection.customRemove(other, (change, remove) => {
                  let action = this.composer.action.deleteMember(other)

                  emit([
                     { source: collection, event: ObservableEvents.removing, data: change },
                     { source: model.members, event: ObservableEvents.removing, data: change },
                     { source: model, event: Events.Model.MemberRemoving, data: action },
                     { source: this.project, event: Events.Model.MemberRemoving, data: action }
                  ])

                  let updatedChange = new ItemRemove<IMember>(other, index)
                  remove([updatedChange])

                  emit([
                     { source: collection, event: ObservableEvents.removed, data: change },
                     { source: model.members, event: ObservableEvents.removed, data: change },
                     { source: model, event: Events.Model.MemberRemoved, data: action },
                     { source: this.project, event: Events.Model.MemberRemoved, data: action }
                  ])
               })
            },
            move: (other, from: number, to: number, collection: IObservableCollection<IMember>): void => {
               let member = collection.at(from)

               collection.customMove(from, to, (change, move) => {
                  let action = this.composer.action.reorderMember(member, from, to)

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
            }
         }
      )
   }


   /**
    * Provided a collection of Restore Info, will update a Collection
    * based on the restore info
    * 
    * @param parent The parent Namespace
    * @param collection The collection in the Parent Namespace to restore
    * @param restores Collection of restore information
    * @param create Function that creates new objects based on the restore info
    */
   async collection<TQualifiedObject extends IQualifiedObject, TRestoreInfo extends RestoreInfo>(
      parent: INamespace,
      collection: IObservableCollection<TQualifiedObject>,
      restores: IObservableCollection<TRestoreInfo>,
      create: (restore: TRestoreInfo) => Promise<TQualifiedObject>
   ): Promise<void> {
      await syncToMasterAsync(
         restores,
         collection,
         {
            equal: async (master: TRestoreInfo, other: TQualifiedObject): Promise<boolean> => {
               if (master.id !== other.id) {
                  return false
               }

               // If they're equal, ensure the other properties are equal
               if (other.name !== master.name) {
                  //@ts-ignore
                  let obj = other as QualifiedObject
                  obj.internalSetName(master.name)
               }

               // Ensure the parent is set correctly
               //@ts-ignore
               if (other.parent.id !== parent.id) {
                  //@ts-ignore
                  let obj = other as QualifiedObject
                  obj.internalSetParent(parent)
               }

               return true
            },
            add: async (master: TRestoreInfo, index: number, collection: IObservableCollection<TQualifiedObject>): Promise<void> => {
               let found = this.search.findObjectById(master.id)

               if (found !== undefined) {
                  // TODO: If found is not a Namespace, delete it
                  let foundObj = found as TQualifiedObject
                  //@ts-ignore
                  let action = this.composer.action.move(foundObj, parent)
                  this.composer.move(foundObj, parent, master.index, action)
               } else {
                  let newObj = await create(master)
                  let action = this.composer.action.create(newObj, index)
                  this.composer.add(newObj, parent, index, action)
                  await this.uidWarden.register(master.id, newObj)
               }
            },
            remove: async (other: TQualifiedObject, index: number, collection: IObservableCollection<TQualifiedObject>): Promise<void> => {
               let action = this.composer.action.delete(other)
               this.composer.remove(other, action)
               await other.update()
            },
            move: async (other: TQualifiedObject, from: number, to: number, collection: IObservableCollection<TQualifiedObject>): Promise<void> => {
               collection.customMove(from, to, (change, move) => {
                  let action = this.composer.action.reorder(other, from, to)

                  let parentChange = Switch.case(other, {
                     Namespace: (ns) => ({ notifying: Events.Namespace.ChildMoving, notified: Events.Namespace.ChildMoved }),
                     Model: (model) => ({ notifying: Events.Namespace.ModelMoving, notified: Events.Namespace.ModelMoved }),
                     Instance: (inst) => ({ notifying: Events.Namespace.InstanceMoving, notified: Events.Namespace.InstanceMoved })
                  })

                  emit([
                     { source: collection, event: ObservableEvents.moving, data: change },
                     { source: parent.namespaces, event: ObservableEvents.moving, data: change },
                     { source: parent, event: parentChange.notifying, data: action },
                     { source: this.project, event: parentChange.notifying, data: action }
                  ])

                  move()

                  emit([
                     { source: collection, event: ObservableEvents.moved, data: change },
                     { source: parent.namespaces, event: ObservableEvents.moved, data: change },
                     { source: parent, event: parentChange.notified, data: action },
                     { source: this.project, event: parentChange.notified, data: action }
                  ])
               })
            }
         }
      )
   }
}