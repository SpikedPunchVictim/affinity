import { CreateAction, RenameAction, MoveAction, DeleteAction, ReorderAction, UpdateAction, GetByIdAction } from "./Actions"
import { INamespace, NamespaceFullRestoreInfo, NamespaceLazyRestoreInfo } from "../Namespace"
import { ActionSet } from './ActionSet'
import { QualifiedObjectGetChildrenAction } from "./QualifiedObject"

export class NamespaceCreateAction extends CreateAction<INamespace> {
   static readonly type: string = ActionSet.NamespaceCreate

   constructor(namespace: INamespace, index: number) {
      super(NamespaceCreateAction.type, namespace, index)
   }
}

export class NamespaceDeleteAction extends DeleteAction<INamespace> {
   static readonly type: string = ActionSet.NamespaceDelete

   constructor(namespace: INamespace) {
      super(NamespaceDeleteAction.type, namespace)
   }
}

export class NamespaceGetByIdAction extends GetByIdAction {
   static readonly type: string = ActionSet.NamespaceGetById

   get restore(): NamespaceLazyRestoreInfo | undefined {
      return this._restore
   }

   private _restore: NamespaceLazyRestoreInfo | undefined = undefined

   constructor(id: string) {
      super(NamespaceGetByIdAction.type, id)
   }
   
   set(restore: NamespaceLazyRestoreInfo): void {
      this._restore = restore
   }
}

export class NamespaceGetChildrenAction extends QualifiedObjectGetChildrenAction<NamespaceLazyRestoreInfo> {
   static readonly type: string = ActionSet.NamespaceGetChildren

   constructor(parent: INamespace) {
      super(NamespaceGetChildrenAction.type, parent)
   }
}

export class NamespaceRenameAction extends RenameAction<INamespace> {
   static readonly type: string = ActionSet.NamespaceRename

   constructor(namespace: INamespace, from: string, to: string) {
      super(NamespaceRenameAction.type, namespace, from, to)
   }
}

export class NamespaceMoveAction extends MoveAction<INamespace> {
   static readonly type: string = ActionSet.NamespaceMove

   constructor(namespace: INamespace, from: INamespace, to: INamespace) {
      super(NamespaceMoveAction.type, namespace, from, to)
   }
}

export class NamespaceReorderAction extends ReorderAction<INamespace> {
   static readonly type: string = ActionSet.NamespaceReorder

   constructor(namespace: INamespace, from: number, to: number) {
      super(NamespaceReorderAction.type, namespace, from, to)
   }
}

export class NamespaceUpdateAction extends UpdateAction<INamespace, NamespaceFullRestoreInfo> {
   static readonly type: string = ActionSet.NamespaceUpdate

   constructor(namespace: INamespace) {
      super(NamespaceUpdateAction.type, namespace)
   }
}