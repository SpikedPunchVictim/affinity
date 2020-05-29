import { IProject, IProjectContext } from "../Project";
import { syncToMasterAsync } from "../utils/Collections";
import { IObservableCollection, ObservableCollection, ObservableEvents } from "../collections/ObservableCollection";
import { INamespace } from "../..";
import { NamespaceLazyRestoreInfo, Namespace, NamespaceFullRestoreInfo } from "../Namespace";
import { QualifiedObjectType, Switch } from "../utils/Types";
import { parentPath } from "../utils/QualifiedPath";
import { NamespaceCreateAction, NamespaceReorderAction, NamespaceMoveAction } from '../actions/Namespace'
import { IUidWarden } from "../UidWarden";
import { Search } from "../Search";
import { Composer } from "./Composer";
import { emit } from "../utils/Eventing";
import { Events } from "../Events";
import { ModelLazyRestoreInfo, IModel, Model } from "../Model";
import { IQualifiedObject, QualifiedObject } from "../QualifiedObject";
import { InstanceLazyRestoreInfo, IInstance, Instance } from "../Instance";
import { RestoreInfo } from '../Restore'


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

   constructor(project: IProject, context: IProjectContext, composer: Composer) {
      this.project = project
      this.context = context
      this.composer = composer
   }

   /**
    * Restores an already existing Namespace
    * 
    * @param namespace The Namespace to restore
    * @param restore The restore information
    */
   async namespace(namespace: INamespace, restore: NamespaceLazyRestoreInfo | NamespaceFullRestoreInfo): Promise<void> {
      let ns = namespace as Namespace

      if(restore.id !== ns.id) {
         throw new Error(`Restore information does not represent the same object being updated. Source ID: ${ns.id}   Restore ID: ${restore.id}`)
      }

      ns.setName(restore.name)

      let parentQualifiedPath = parentPath(restore.qualifiedPath)

      if(parentQualifiedPath === undefined) {
         throw new Error(`Encountered invalid parent Qualified Path When restoring a Namespace`)
      }

      let parent = await this.project.get<INamespace>(QualifiedObjectType.Namespace, parentQualifiedPath)

      if(parent === undefined) {
         throw new Error(`Failed to retrieve the parent Namespace when restoring a Namespace`)
      }

      // Does it need to be moved?
      if(ns.parent == null) {
         // Has no Parent (no idea how we would get here)
         // TODO: Revisit this action type here
         this.composer.add(ns, parent, restore.index, new NamespaceCreateAction(ns, restore.index))
      } else if(parent.id !== ns.parent.id) {
         this.composer.move(ns, parent, restore.index, new NamespaceMoveAction(ns, ns.parent, parent))
      } else {
         // Does it need to be moved?
         let currentIndex = parent.children.observable.findIndex(n => n.id === ns.id)

         if(currentIndex !== restore.index) {
            let action = new NamespaceReorderAction(ns, currentIndex, restore.index)
            this.composer.reorder(ns, parent.children, action.from, action.to, action)
         }
      }

      let isFullRestore = (restore instanceof NamespaceFullRestoreInfo)

      if(!isFullRestore) {
         // We're done
         return
      }

      let full = restore as NamespaceFullRestoreInfo

      try {

      // Update the Namespace collections
      await this.collection<INamespace, NamespaceLazyRestoreInfo>(
         namespace,
         namespace.children.observable,
         new ObservableCollection(...full.children),
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

      } catch(err) {
         console.error(err)
      }
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
   ) {
      await syncToMasterAsync(
         restores,
         collection,
         {
            equal: async (master: TRestoreInfo, other: TQualifiedObject): Promise<boolean> => {
               try {
               if(master.id !== other.id) {
                  return false
               }

               // If they're equal, ensure the other properties are equal
               if(other.name !== master.name) {
                  //@ts-ignore
                  let obj = other as QualifiedObject
                  obj.setName(master.name)
               }

               // Ensure the parent is set correctly
               //@ts-ignore
               if(other.parent.id !== parent.id) {
                  //@ts-ignore
                  let obj = other as QualifiedObject
                  obj.setParent(parent)
               }

               return true
            } catch(err) {
               console.error(err)
               return false
            }
            },
            add: async (master: TRestoreInfo, index: number, collection: IObservableCollection<TQualifiedObject>): Promise<void> => {
               let found = this.search.findObjectById(master.id)

               if(found !== undefined) {
                  // TODO: If found is not a Namespace, delete it
                  let foundObj = found as TQualifiedObject
                  //@ts-ignore
                  this.composer.move(foundObj, parent, master.index, new NamespaceMoveAction(foundObj, foundObj.parent, parent))
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
                     { source: parent.children, event: ObservableEvents.moving, data: change },
                     { source: parent, event: parentChange.notifying, data: action },
                     { source: this.project, event: parentChange.notifying, data: action }
                  ])

                  move()

                  emit([
                     { source: collection, event: ObservableEvents.moved, data: change },
                     { source: parent.children, event: ObservableEvents.moved, data: change },
                     { source: parent, event: parentChange.notified, data: action },
                     { source: this.project, event: parentChange.notified, data: action }
                  ])
               })
            }
         }
      )
   }
}