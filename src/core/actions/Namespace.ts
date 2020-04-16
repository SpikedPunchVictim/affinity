import { RfcAction, RenameAction, MoveAction, DeleteAction } from "./Actions"
import { INamespace } from "../Namespace"


export class NamespaceCreateAction extends RfcAction {
   static readonly type: string = 'namespace-create'
   readonly namespace: INamespace

   constructor(namespace: INamespace) {
      super(NamespaceCreateAction.type)
      this.namespace = namespace
   }
}

export class NamespaceDeleteAction extends DeleteAction<INamespace> {
   static readonly type: string = 'namespace-delete'

   constructor(namespace: INamespace) {
      super(NamespaceDeleteAction.type, namespace)
   }
}

export class NamespaceRenameAction extends RenameAction<INamespace> {
   static readonly type: string = 'namespace-rename'

   constructor(namespace: INamespace, from: string, to: string) {
      super(NamespaceRenameAction.type, namespace, from, to)
   }
}

export class NamespaceMoveAction extends MoveAction<INamespace> {
   static readonly type: string = 'namespace-move'

   constructor(namespace: INamespace, from: INamespace, to: INamespace) {
      super(NamespaceMoveAction.type, namespace, from, to)
   }
}