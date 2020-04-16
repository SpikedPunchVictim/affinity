import { ObservableCollection, EventMap, IObservableCollection } from "./ObservableCollection";
import { INamedObject } from "../NamedObject";
import { ArgumentError } from "../../errors";

export interface INamedCollection<T> extends IObservableCollection<T> {
   get(name: string): T | undefined
   delete(name: string): Promise<void>
}

export class NamedCollection<T extends INamedObject> 
   extends ObservableCollection<T> 
   implements INamedCollection<T> {

   constructor(eventMap?: EventMap) {
      super(eventMap)
   }

   get(name: string): T | undefined {
      if(name == null) {
         throw new ArgumentError(`name must be valid`)
      }

      for(let item of this.items) {
         if(item.name.toLowerCase() === name.toLowerCase()) {
            return item
         }
      }

      return undefined
   }

   delete(name: string): Promise<void> {
      let found = this.get(name)

      if(found === undefined) {
         return Promise.resolve()
      }

      super.remove(found)
      
      return Promise.resolve()
   }
}