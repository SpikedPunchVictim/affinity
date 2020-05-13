import { RfcAction, RenameAction, MoveAction, DeleteAction, ReorderAction } from "./Actions"
import { INamespace } from "../Namespace"
import { ActionSet } from './ActionSet'
import { QualifiedObjectGetAction } from "./QualifiedObject"

export class NamespaceCreateAction extends RfcAction {
   static readonly type: string = ActionSet.NamespaceCreate
   readonly namespace: INamespace

   constructor(namespace: INamespace) {
      super(NamespaceCreateAction.type)
      this.namespace = namespace
   }
}

export class NamespaceDeleteAction extends DeleteAction<INamespace> {
   static readonly type: string = ActionSet.NamespaceDelete

   constructor(namespace: INamespace) {
      super(NamespaceDeleteAction.type, namespace)
   }
}

export class NamespaceGetAction extends QualifiedObjectGetAction<INamespace> {
   static readonly type: string = ActionSet.NamespaceGet

   constructor(parent: INamespace, indexes: number[] | undefined) {
      super(NamespaceGetAction.type, parent, indexes)
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

