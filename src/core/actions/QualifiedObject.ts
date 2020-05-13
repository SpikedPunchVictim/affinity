import { RfcAction } from "./Actions"
import { IQualifiedObject } from "../QualifiedObject"
import { INamespace } from "../Namespace"
import { ActionSet } from './ActionSet'
import { IndexableItem } from "../collections/ChangeSets"


export class ParentChangeAction extends RfcAction {
   static readonly type: string = ActionSet.ParentChange
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

export abstract class QualifiedObjectGetAction<T extends IQualifiedObject> extends RfcAction {
   readonly parent: INamespace
   readonly indexes: number[] | undefined
   
   results: Array<IndexableItem<T>> | undefined = undefined

   constructor(type: string, parent: INamespace, indexes: number[] | undefined) {
      super(type)
      this.parent = parent
      this.indexes = indexes
   }

   set(items: IndexableItem<T>[] | undefined): void {
      this.results = items
   }
}