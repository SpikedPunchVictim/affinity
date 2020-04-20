import { IQualifiedObject, QualifiedObject } from "./QualifiedObject";
import { INamespace, Namespace } from "./Namespace";
import { Switch, QualifiedObjectType, as, asCollection } from "./utils/Types";
import { IProject, IProjectContext } from "./Project";
import { ArgumentError } from "../errors/ArgumentError";
import { NameCollisionError } from "../errors/NameCollisionError";
import { ParentChangeAction } from "./actions/QualifiedObject";
import { ObservableCollection, NamespaceCollection, ObservableEvents, ModelCollection, InstanceCollection } from "./collections";
import { Events } from "./Events";
import { NamespaceRenameAction, ModelRenameAction, InstanceRenameAction, IRfcAction, NamespaceCreateAction, ModelCreateAction, InstanceCreateAction } from "./actions";
import { IModel, Model } from "./Model";
import { IInstance, Instance } from "./Instance";
import { RfcError } from "../errors/RfcError";

export interface IOrchestrator {
   createNamespace(parent: INamespace, name: string): Promise<INamespace>
   createModel(parent: INamespace, name: string): Promise<IModel>
   createInstance(parent: INamespace, model: IModel, name: string): Promise<IInstance>
   rename(source: IQualifiedObject, newName: string): Promise<IQualifiedObject>
   move(source: IQualifiedObject, to: INamespace): Promise<IQualifiedObject>
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

   async createNamespace(parent: INamespace, name: string): Promise<INamespace> {
      let namespace = new Namespace(parent, name, this.context)

      await this.rfc.create(new NamespaceCreateAction(namespace))
         .fulfill(async (action) => {
            let children = asCollection<INamespace, NamespaceCollection>(parent.children)

            let change = children.createAddChangelist(namespace)
            children.emit(ObservableEvents.adding, change)
            parent.emit(Events.Namespace.ChildAdding, action)
            children.performAdd(change)
            children.emit(ObservableEvents.added, change)
            parent.emit(Events.Namespace.ChildAdded, action)
         })
         .reject(async (action: IRfcAction, err?: Error) => {
            throw new RfcError(action, err)
         })
         .commit()

      return namespace
   }

   async createModel(parent: INamespace, name: string): Promise<IModel> {
      let model = new Model(parent, name, this.context)

      await this.rfc.create(new ModelCreateAction(model))
         .fulfill(async (action) => {
            let children = asCollection<IModel, ModelCollection>(parent.models)

            let change = children.createAddChangelist(model)
            children.emit(ObservableEvents.adding, change)
            parent.emit(Events.Namespace.ModelAdding, action)
            children.performAdd(change)
            children.emit(ObservableEvents.added, change)
            parent.emit(Events.Namespace.ModelAdded, action)
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

            let change = children.createAddChangelist(instance)
            children.emit(ObservableEvents.adding, change)
            parent.emit(Events.Namespace.InstanceAdding, action)
            children.performAdd(change)
            children.emit(ObservableEvents.added, change)
            parent.emit(Events.Namespace.InstanceAdded, action)
         })
         .reject(async (action: IRfcAction, err?: Error) => {
            throw new RfcError(action, err)
         })
      .commit()

      return instance
   }

   async rename(source: IQualifiedObject, newName: string): Promise<IQualifiedObject> {
      let action = Switch.case<IRfcAction>(source, {
         Namespace: (obj) => new NamespaceRenameAction(as<INamespace>(source), source.name, newName),
         Model: (obj) => new ModelRenameAction(as<IModel>(source), source.name, newName),
         Instance: (obj) => new InstanceRenameAction(as<IInstance>(source), source.name, newName)
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

      // TODO: Validate move
      let found = await this.project.get(QualifiedObjectType.Namespace, to.qualifiedName)
      
      if(!found) {
         throw new ArgumentError(`The 'to' Namespace provided to move() doesn't exist in this project`)
      }

      // Is there a QualifiedObject with that name already at the destination?
      let exists = Switch.case<boolean>(to, {
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
               let change = from.createRemoveChangelist(src)
               from.emit(ObservableEvents.removing, change)

               //@ts-ignore
               src.parent.emit(removingEvent, action)

               from.performRemove(change)

               from.emit(ObservableEvents.removed, change)

               //@ts-ignore
               src.parent.emit(removedEvent, action)
            }

            let add = <T extends IQualifiedObject>(
               src: T,
               to: ObservableCollection<T>,
               addingEvent: string,
               addedEvent: string
            ) => {
               let change = to.createAddChangelist(src)
               to.emit(ObservableEvents.adding, change)

               //@ts-ignore
               src.parent.emit(addingEvent, action)

               to.performAdd(change)

               to.emit(ObservableEvents.added, change)

               //@ts-ignore
               src.parent.emit(addedEvent, action)
            }

            let performMove = <T extends IQualifiedObject>(
               source: T,
               to: ObservableCollection<T>,
               removing: string,
               removed: string,
               adding: string,
               added: string
            ) => {
               let hasRemoved = false
               try {
                  //@ts-ignore
                  remove(source, source.parent, removing, removed)
                  hasRemoved = true
                  add<T>(source, to, adding, added)
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
                     as<INamespace>(source),
                     asCollection<INamespace, ObservableCollection<INamespace>>(to.children),
                     Events.Namespace.ChildRemoving,
                     Events.Namespace.ChildRemoved,
                     Events.Namespace.ChildAdding,
                     Events.Namespace.ChildAdded
                  )
               },
               Model: (obj) => {
                  performMove(
                     as<IModel>(source),
                     asCollection<IModel, ObservableCollection<IModel>>(to.models),
                     Events.Namespace.ModelRemoving,
                     Events.Namespace.ModelRemoved,
                     Events.Namespace.ModelAdding,
                     Events.Namespace.ModelAdded
                  )
               },
               Instance: (obj) => {
                  performMove<IInstance>(
                     as<IInstance>(source),
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
}