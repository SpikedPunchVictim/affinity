import { IProject } from "../../src/core/Project"
import { IActionRouter } from "../../src/core/actions/ActionRouter"
import { ProjectOpenAction, ProjectCommitAction } from "../../src/core/actions/Project"
import { IRfcAction, BatchedActions } from "../../src/core/actions/Actions"
import { NamespaceCreateAction, NamespaceDeleteAction, NamespaceRenameAction, NamespaceMoveAction, NamespaceGetByIdAction, NamespaceGetChildrenAction, NamespaceReorderAction, NamespaceUpdateAction } from "../../src/core/actions/Namespace"
import { ModelCreateAction, ModelDeleteAction, ModelRenameAction, ModelMoveAction, MemberCreateAction, MemberDeleteAction, MemberRenameAction, MemberReorderAction, ModelReorderAction, ModelGetChildrenAction, ModelUpdateAction, ModelGetMembersAction } from "../../src/core/actions/Model"
import { IPlugin } from "../../src/core/plugins/Plugin"

import {
   InstanceCreateAction,
   InstanceDeleteAction,
   InstanceRenameAction,
   InstanceMoveAction,
   FieldCreateAction,
   FieldDeleteAction,
   FieldRenameAction,
   FieldReorderAction,
   InstanceReorderAction,
   InstanceGetChildrenAction,
   InstanceUpdateAction
} from "../../src/core/actions/Instance"

import { InstanceFullRestoreInfo, InstanceLazyRestoreInfo, IInstance } from '../../src/core/Instance'
import { INamespace, NamespaceFullRestoreInfo, NamespaceLazyRestoreInfo } from "../../src/core/Namespace"
import { ModelFullRestoreInfo, ModelLazyRestoreInfo, IModel } from '../../src/core/Model'
import { QualifiedObjectType, Switch } from "../../src/core/utils"
import { IQualifiedObject } from "../../src/core/QualifiedObject"
import { IObservableCollection } from "../../src/core/collections/ObservableCollection"
import { RestoreInfo } from '../../src/core/Restore'
import { Search } from "../../src/core/Search"
import { MemberRestoreInfo } from "../../src/core/Member"
import { FieldRestoreInfo } from "../../src/core/Field"

export class TestPlugin implements IPlugin {
   readonly name: string = 'test-only-plugin'

   callMap: Map<string, IRfcAction> = new Map<string, IRfcAction>()

   constructor() {

   }

   isSet(type: string) {
      return this.callMap.get(type) !== undefined
   }

   reset(): void {
      this.callMap.clear()
   }

   register<TAction extends IRfcAction>(router: IActionRouter, type: string): void {
      router.on<TAction>(type, async (action) => {
         if(type === BatchedActions.type) {
            //@ts-ignore
            let batched = action as BatchedActions
            batched.actions.forEach(act => this.callMap.set(act.type, act))
            return
         }

         this.callMap.set(type, action)
      })
   }

   async setup(project: IProject, router: IActionRouter): Promise<void> {
      this.register<ProjectOpenAction>(router, ProjectOpenAction.type)
      this.register<ProjectCommitAction>(router, ProjectCommitAction.type)
      this.register<BatchedActions>(router, BatchedActions.type)

      this.register<NamespaceCreateAction>(router, NamespaceCreateAction.type)
      this.register<NamespaceDeleteAction>(router, NamespaceDeleteAction.type)
      this.register<NamespaceRenameAction>(router, NamespaceRenameAction.type)
      this.register<NamespaceMoveAction>(router, NamespaceMoveAction.type)
      this.register<NamespaceReorderAction>(router, NamespaceReorderAction.type)

      this.register<ModelCreateAction>(router, ModelCreateAction.type)
      this.register<ModelDeleteAction>(router, ModelDeleteAction.type)
      this.register<ModelRenameAction>(router, ModelRenameAction.type)
      this.register<ModelMoveAction>(router, ModelMoveAction.type)
      this.register<ModelReorderAction>(router, ModelReorderAction.type)

      this.register<InstanceCreateAction>(router, InstanceCreateAction.type)
      this.register<InstanceDeleteAction>(router, InstanceDeleteAction.type)
      this.register<InstanceRenameAction>(router, InstanceRenameAction.type)
      this.register<InstanceMoveAction>(router, InstanceMoveAction.type)
      this.register<InstanceReorderAction>(router, InstanceReorderAction.type)

      this.register<FieldCreateAction>(router, FieldCreateAction.type)
      this.register<FieldDeleteAction>(router, FieldDeleteAction.type)
      this.register<FieldRenameAction>(router, FieldRenameAction.type)
      this.register<FieldReorderAction>(router, FieldReorderAction.type)

      this.register<MemberCreateAction>(router, MemberCreateAction.type)
      this.register<MemberDeleteAction>(router, MemberDeleteAction.type)
      this.register<MemberRenameAction>(router, MemberRenameAction.type)
      this.register<MemberReorderAction>(router, MemberReorderAction.type)
   }
}

export class DebugPlugin implements IPlugin {
   name: string = "debug-plugin"

   readonly project: IProject

   constructor(project: IProject) {
      this.project = project
   }

   register<TAction extends IRfcAction>(router: IActionRouter, type: string): void {
      router.on<TAction>(type, async (action) => {
         if(type === BatchedActions.type) {
            //@ts-ignore
            let batched = action as BatchedActions
            console.log(`${this.project.name}: ${batched.type}: ${batched.actions}`)
            return
         }

         console.log(`${this.project.name}: ${action.type}`)
      })
   }

   async setup(project: IProject, router: IActionRouter): Promise<void> {
      this.register<ProjectOpenAction>(router, ProjectOpenAction.type)
      this.register<ProjectCommitAction>(router, ProjectCommitAction.type)
      this.register<BatchedActions>(router, BatchedActions.type)

      this.register<NamespaceCreateAction>(router, NamespaceCreateAction.type)
      this.register<NamespaceDeleteAction>(router, NamespaceDeleteAction.type)
      this.register<NamespaceRenameAction>(router, NamespaceRenameAction.type)
      this.register<NamespaceMoveAction>(router, NamespaceMoveAction.type)
      this.register<NamespaceReorderAction>(router, NamespaceReorderAction.type)

      this.register<ModelCreateAction>(router, ModelCreateAction.type)
      this.register<ModelDeleteAction>(router, ModelDeleteAction.type)
      this.register<ModelRenameAction>(router, ModelRenameAction.type)
      this.register<ModelMoveAction>(router, ModelMoveAction.type)
      this.register<ModelReorderAction>(router, ModelReorderAction.type)

      this.register<InstanceCreateAction>(router, InstanceCreateAction.type)
      this.register<InstanceDeleteAction>(router, InstanceDeleteAction.type)
      this.register<InstanceRenameAction>(router, InstanceRenameAction.type)
      this.register<InstanceMoveAction>(router, InstanceMoveAction.type)
      this.register<InstanceReorderAction>(router, InstanceReorderAction.type)

      this.register<FieldCreateAction>(router, FieldCreateAction.type)
      this.register<FieldDeleteAction>(router, FieldDeleteAction.type)
      this.register<FieldRenameAction>(router, FieldRenameAction.type)
      this.register<FieldReorderAction>(router, FieldReorderAction.type)

      this.register<MemberCreateAction>(router, MemberCreateAction.type)
      this.register<MemberDeleteAction>(router, MemberDeleteAction.type)
      this.register<MemberRenameAction>(router, MemberRenameAction.type)
      this.register<MemberReorderAction>(router, MemberReorderAction.type)
   }

}

export class DataPlugin implements IPlugin {
   readonly name: string = 'data-plugin'

   restore: Map<QualifiedObjectType, any> = new Map<QualifiedObjectType, any>()
   project: IProject
   search: Search

   constructor(project: IProject) {
      this.project = project
      this.search = new Search(project)
   }

   addRestore(restore: any): void {
      if (restore instanceof NamespaceFullRestoreInfo) {
         this.restore.set(QualifiedObjectType.Namespace, restore)
      }

      if (restore instanceof ModelFullRestoreInfo) {
         this.restore.set(QualifiedObjectType.Model, restore)
      }

      if (restore instanceof InstanceFullRestoreInfo) {
         this.restore.set(QualifiedObjectType.Instance, restore)
      }
   }

   async setup(project: IProject, router: IActionRouter): Promise<void> {
      router.on<NamespaceCreateAction>(NamespaceCreateAction.type, async (action) => {
      })

      router.on<NamespaceDeleteAction>(NamespaceDeleteAction.type, async (action) => {
      })

      router.on<NamespaceGetByIdAction>(NamespaceGetByIdAction.type, async (action) => {
         let found = this.search.findObjectById(action.id)

         if (!found) {
            return
         }

         let index = found.parent == null ? 0 : found.parent.namespaces.observable.findIndex(n => n.id === action.id)

         action.set(new NamespaceLazyRestoreInfo(
            found.name,
            found.qualifiedName,
            found.id,
            found.parent ? found.parent.id : "-1",
            index
         ))
      })

      router.on<NamespaceGetChildrenAction>(NamespaceGetChildrenAction.type, async (action) => {
         let found = this.search.findObjectById(action.parent.id) as INamespace

         if (!found) {
            return
         }

         action.restore = 
            this.buildCollectionRestore(QualifiedObjectType.Namespace, found.namespaces.observable)
      })

      router.on<NamespaceRenameAction>(NamespaceRenameAction.type, async (action) => {
      })

      router.on<NamespaceMoveAction>(NamespaceMoveAction.type, async (action) => {
      })

      router.on<NamespaceReorderAction>(NamespaceReorderAction.type, async (action) => {
      })

      router.on<NamespaceUpdateAction>(NamespaceUpdateAction.type, async (action) => {        
         let found = this.search.findObjectById(action.source.id) as INamespace

         if (!found) {
            return
         }

         let index = found.parent == null ? 0 : found.parent.namespaces.observable.findIndex(n => n.id === action.source.id)

         let restore = new NamespaceFullRestoreInfo(
            found.name,
            found.qualifiedName,
            found.id,
            found.parent ? found.parent.id : "-1",
            index
         )

         restore.namespaces =
            this.buildCollectionRestore(QualifiedObjectType.Namespace, found.namespaces.observable)

         restore.models =
            this.buildCollectionRestore(QualifiedObjectType.Model, found.models.observable)

         restore.instances =
            this.buildCollectionRestore(QualifiedObjectType.Instance, found.instances.observable)

         action.restore = restore
      })

      router.on<ModelUpdateAction>(ModelUpdateAction.type, async (action) => {
         let found = this.search.findObjectById(action.source.id) as IModel

         if (!found) {
            return
         }

         let restore = new ModelFullRestoreInfo(
            found.name,
            found.qualifiedName,
            found.id,
            //@ts-ignore
            found.parent.id
         )

         let members = new Array<MemberRestoreInfo>()

         for(let i = 0; i < found.members.length; ++i) {
            let member = found.members.observable.at(i)
            members.push(new MemberRestoreInfo(member.name, member.value.clone(), member.id, member.model.id, i))
         }

         restore.members = members
         action.restore = restore
      })

      router.on<ModelGetMembersAction>(ModelGetMembersAction.type, async (action) => {
         let found = this.search.findObjectById(action.model.id) as IModel

         if (!found) {
            return
         }

         let members = new Array<MemberRestoreInfo>()

         for(let i = 0; i < found.members.length; ++i) {
            let member = found.members.observable.at(i)
            members.push(new MemberRestoreInfo(member.name, member.value.clone(), member.id, member.model.id, i))
         }

         action.restore = members
      })

      router.on<ModelGetChildrenAction>(ModelGetChildrenAction.type, async (action) => {
         let found = this.search.findObjectById(action.parent.id) as INamespace

         if (!found) {
            return
         }

         action.restore = 
            this.buildCollectionRestore(QualifiedObjectType.Model, found.models.observable)
      })

      router.on<InstanceUpdateAction>(InstanceUpdateAction.type, async (action) => {
         let found = this.search.findObjectById(action.source.id) as IInstance

         if (!found) {
            return
         }

         let restore = new InstanceFullRestoreInfo(
            found.name,
            found.qualifiedName,
            found.id,
            found.model.id,
            //@ts-ignore
            found.parent.id
         )

         for(let i = 0; i < found.fields.length; ++i) {
            let field = found.fields.observable.at(i)
            restore.fields.push(new FieldRestoreInfo(field.name, field.id, field.value.clone(), i, field.attachment))
         }

         action.restore = restore
      })

      router.on<InstanceGetChildrenAction>(InstanceGetChildrenAction.type, async (action) => {
         let found = this.search.findObjectById(action.parent.id) as INamespace

         if (!found) {
            return
         }

         action.restore = 
            this.buildCollectionRestore(QualifiedObjectType.Instance, found.instances.observable)
      })
   }

   buildCollectionRestore<TObject extends IQualifiedObject, TRestore extends RestoreInfo>(
      type: QualifiedObjectType,
      collection: IObservableCollection<TObject>): TRestore[] {
         //@ts-ignore
         let create = Switch.onType<(obj: TObject, index: number) => TRestore>(type, {
            //@ts-ignore
            Namespace: () => {
               return (obj: INamespace, index: number) => new NamespaceLazyRestoreInfo(
                  obj.name,
                  obj.qualifiedName,
                  obj.id,
                  obj.parent ? obj.parent.id : "-1",
                  index
               )},
            //@ts-ignore
            Model: () => {
               return (obj: IModel, index: number) => new ModelLazyRestoreInfo(
                  obj.name,
                  obj.qualifiedName,
                  obj.id,
                  obj.parent ? obj.parent.id : "-1",
                  index
               )
            },
            //@ts-ignore
            Instance: () => {
               return (obj: IInstance, index: number) => new InstanceLazyRestoreInfo(
                  obj.name,
                  obj.qualifiedName,
                  obj.id,
                  obj.model.id,
                  obj.parent ? obj.parent.id : "-1",
                  index
               )
            }
         })

         let restores = new Array<TRestore>()
         for (let i = 0; i < collection.length; ++i) {
            let obj = collection.at(i)
            restores.push(create(obj, i))
         }

         return restores
   }
}