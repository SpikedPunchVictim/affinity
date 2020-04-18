import { IRfcAction } from "./Actions"

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

   on<T extends IRfcAction>(type: string, handler: ActionHandler<T>): void {
      let found = this._handlerMap.get(type)

      if(found === undefined) {
         let array = new Array<ActionHandler<T>>()
         array.push(handler)
         this._handlerMap.set(type, array)
      } else {
         found.push(handler)
      }
   }

   raise<T extends IRfcAction>(action: IRfcAction): Promise<void> {
      return new Promise(async (resolve, reject) => {
         let found = this._handlerMap.get(action.type)

         if(found === undefined) {
            return resolve()
         }
   
         let promises = new Array<Promise<void>>()
   
         for(let handler of found) {
            promises.push(handler(action))
         }
   
         try {
            await Promise.all(promises)
            resolve()
         } catch(err) {
            reject(err)
         }
      })
   }
}