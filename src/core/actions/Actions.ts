import { IValue } from "../Value"
import { INamespace } from "../.."

export interface IRfcAction {
   readonly type: string
}

export class BatchedActions<T extends IRfcAction> implements IRfcAction {
   static readonly type: string = 'rfc-batched-actions'
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
}

export class CreateAction<T> extends RfcAction {
   readonly source: T

   constructor(type: string, source: T) {
      super(type)
      this.source = source
   }
}

export class DeleteAction<T> extends RfcAction {
   readonly source: T

   constructor(type: string, source) {
      super(type)
      this.source = source
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