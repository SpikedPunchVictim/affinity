import { IQualifiedObject } from "../QualifiedObject"
import { IRfcAction, ReorderAction } from "../actions/Actions"
import { Switch, QualifiedObjectType } from "../utils/Types"
import { IModel } from "../Model"
import { IMember } from "../Member"
import { INamespace } from "../Namespace"

import { 
   NamespaceDeleteAction,
   NamespaceCreateAction,
   NamespaceGetChildrenAction,
   NamespaceMoveAction,
   NamespaceRenameAction,
   NamespaceReorderAction,
   NamespaceUpdateAction } from '../actions/Namespace'

import {
   ModelDeleteAction,
   ModelCreateAction,
   ModelRenameAction,
   ModelMoveAction,
   ModelGetChildrenAction,
   ModelReorderAction,
   ModelUpdateAction,
   MemberCreateAction, 
   MemberDeleteAction,
   MemberReorderAction} from '../actions/Model'

import {
   InstanceDeleteAction,
   InstanceRenameAction,
   InstanceMoveAction,
   InstanceGetChildrenAction,
   InstanceCreateAction,
   InstanceReorderAction,
   InstanceUpdateAction } from '../actions/Instance'

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

   createMember(model: IModel, member: IMember, index: number): IRfcAction {
      return new MemberCreateAction(model, member, index)
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

   deleteMember(member: IMember): IRfcAction {
      return new MemberDeleteAction(member)
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

   reorderMember(member: IMember, from: number, to: number): IRfcAction {
      return new MemberReorderAction(member, from, to)
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
