import { RfcAction } from "./Actions"
import { IQualifiedObject } from "../QualifiedObject"
import { INamespace } from "../Namespace"


export class ParentChangeAction extends RfcAction {
   static readonly type: string = 'qualifiedobject-parent-change'
   readonly source: IQualifiedObject
   readonly from: INamespace
   readonly to: INamespace

   constructor(source: IQualifiedObject, from: INamespace, to: INamespace) {
      super(ParentChangeAction.type)
      this.source = source
      this.from = from
      this.to = to
   }
}