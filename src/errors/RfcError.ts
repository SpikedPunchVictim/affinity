import { IRfcAction } from "../core";

export class RfcError extends Error {
   readonly action: IRfcAction
   readonly error?: Error

   constructor(action: IRfcAction, error?: Error) {
      super(`Request For Change has failed for action ${action.type}`)
      this.action = action
      this.error = error
   }
}