import { RfcAction } from "./Actions"
import { INamespace } from "../Namespace"
import { RestoreInfo } from '../Restore'

// export abstract class QualifiedObjectExistsAction<T extends IQualifiedObject> extends RfcAction {
//    constructor() {
//       super()
//    }
// }

export abstract class QualifiedObjectGetChildrenAction<TRestore extends RestoreInfo> extends RfcAction {
   readonly parent: INamespace
   
   get restore(): Array<TRestore> | undefined {
      return this._restore
   }

   set restore(val: Array<TRestore> | undefined) {
      this._restore = val
      this._contentsUpdated = val !== undefined
   }

   get contentsUpdated(): boolean {
      return this._contentsUpdated
   }

   private _contentsUpdated: boolean = false
   private _restore: Array<TRestore> | undefined = undefined

   constructor(type: string, parent: INamespace) {
      super(type)
      this.parent = parent
   }
}