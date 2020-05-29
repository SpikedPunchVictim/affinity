import { IRfcAction } from "./Actions"
import { ActionSet } from "./ActionSet"

export type ActionHandler<T extends IRfcAction> = (action: T) => Promise<void>

export interface IActionRouter {
   on<T extends IRfcAction>(type: string, handler: ActionHandler<T>): void
   raise(action: IRfcAction): Promise<void>
}

export class ActionRouter implements IActionRouter {

   // Key: Event name
   // Value: The ActionHandler<T>
   private _handlerMap: Map<string, Array<ActionHandler<any>>>

   constructor() {
      this._handlerMap = new Map<string, Array<ActionHandler<any>>>()
   }

   on<T extends IRfcAction>(type: ActionSet, handler: ActionHandler<T>): void {
      let found = this._handlerMap.get(type)

      if (found === undefined) {
         let array = new Array<ActionHandler<T>>()
         array.push(handler)
         this._handlerMap.set(type, array)
      } else {
         found.push(handler)
      }
   }

   async raise<T extends IRfcAction>(action: IRfcAction): Promise<void> {
      try {
         let found = this._handlerMap.get(action.type)

         if (found === undefined) {
            return
         }

         let promises = new Array<Promise<void>>()

         for (let handler of found) {
            promises.push(handler(action))
         }

         await Promise.all(promises)
      } catch (err) {
         console.log(`REMOVE THESE LOGS AFTER DEVELOPMENT`)
         console.error(err)
         throw err
      }
   }
}