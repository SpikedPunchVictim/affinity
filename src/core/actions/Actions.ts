import { IValue } from "../values/Value"
import { INamespace } from "../Namespace"
import { IObservableCollection } from "../collections/ObservableCollection"
import { ActionSet } from "./ActionSet"

export interface IRfcAction {
   readonly type: string
}

export class BatchedActions implements IRfcAction {
   static readonly type: string = ActionSet.Batched
   readonly type: string = BatchedActions.type
   readonly actions: Array<IRfcAction>

   constructor(actions: Array<IRfcAction>) {
      this.actions = actions
   }
}

export class RfcAction implements IRfcAction {
   readonly type: string

   constructor(type: string) {
      this.type = type
   }

   static as<TResult extends IRfcAction>(obj: IRfcAction): TResult {
      return obj as TResult
   }
}

export class IndexedAction<T> extends RfcAction {
   readonly collection: IObservableCollection<T>
   readonly index: number
   readonly item: T

   constructor(type: string, collection: IObservableCollection<T>, item: T, index: number = -1) {
      super(type)
      this.collection = collection
      this.item = item
      this.index = index
   }
}

export class CreateAction<T> extends RfcAction {
   readonly source: T
   readonly index: number

   constructor(type: string, source: T, index: number) {
      super(type)
      this.source = source
      this.index = index
   }
}

export class DeleteAction<T> extends RfcAction {
   readonly source: T

   constructor(type: string, source) {
      super(type)
      this.source = source
   }
}

export class GetByIdAction extends RfcAction {
   readonly id: string

   constructor(type: string, id: string) {
      super(type)
      this.id = id
   }
}

export class ReorderAction<T> extends RfcAction {
   readonly source: T
   readonly from: number
   readonly to: number

   constructor(type: string, source: T, from: number, to: number) {
      super(type)
      this.source = source
      this.from = from
      this.to = to
   }
}

export class RenameAction<T> extends RfcAction {
   readonly source: T
   readonly from: string
   readonly to: string
   
   constructor(type: string, source: T, from: string, to: string) {
      super(type)
      this.source = source
      this.from = from
      this.to = to
   }
}

export class UpdateAction<TSource, TRestore> extends RfcAction {
   readonly source: TSource
   public restore: TRestore | null = null

   get contentsUpdated(): boolean {
      return this._contentsUpdated || this.restore != null
   }

   get exists(): boolean {
      return this._exists
   }

   // Set to false if the Object no longer exists
   set exists(val: boolean) {
      this._exists = val
      this._contentsUpdated = true
   }

   private _exists: boolean = true
   private _contentsUpdated: boolean = false

   constructor(type: string, source: TSource) {
      super(type)
      this.source = source
   }
}

export class ValueChangeAction<T> extends RfcAction {
   readonly source: T
   readonly from: IValue
   readonly to: IValue

   constructor(type: string, source: T, from: IValue, to: IValue) {
      super(type)
      this.source = source
      this.from = from
      this.to = to
   }
}

export class MoveAction<T> extends RfcAction {
   readonly source: T
   readonly from: INamespace
   readonly to: INamespace

   constructor(type: string, source: T, from: INamespace, to: INamespace) {
      super(type)
      this.source = source
      this.from = from
      this.to = to
   }
}