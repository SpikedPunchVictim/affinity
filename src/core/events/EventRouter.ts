import { IEvent } from './Base'

/*
   EventBus
      A single event bus for the application. It will allow any depth of
      child buses to attach to it. Child bus events are emitted up through their parents.
      This means that:
         Parent --> subscribers listen for event 'E' here too
            |- Child --> subscribers listen for event 'E' here too
                |- SubChild --> raises event 'E' (subscribers can listen to it on the SubChild)


*/

export type EventHandler<T extends IEvent> = (event: T) => Promise<void>

export interface IEventRouter {
   on<T extends IEvent>(event: EventHandler<T>): void
}

export class EventRouter implements IEventRouter {
   
   // Key: Event name
   // Value: The EventHandler<T>
   private _handlerMap: Map<string, Array<EventHandler<any>>>

   constructor() {
      this._handlerMap = new Map<string, Array<EventHandler<any>>>()
   }

   on<T extends IEvent>(event: EventHandler<T>): void {
      let found = this._handlerMap.get(event.name)

      if(found === undefined) {
         let array = new Array<EventHandler<T>>()
         array.push(event)
         this._handlerMap.set(event.name, array)
      } else {
         found.push(event)
      }
   }

   raise<T extends IEvent>(event: IEvent): Promise<void> {
      let found = this._handlerMap.get(event.name)

      if(found === undefined) {
         return Promise.resolve()
      }

      let promises = new Array<Promise<void>>()

      for(let handler of found) {
         promises.push(handler(event))
      }

      return Promise.all(promises)
         .then(() => Promise.resolve())
   }
}