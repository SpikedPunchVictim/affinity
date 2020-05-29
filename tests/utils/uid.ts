import { IUidWarden, HexUidWarden, UidContext, IIDCarrier } from "../../src/core/UidWarden"
import { IQualifiedObject } from "../../src/core"
import { QualifiedObjectType } from "../../src/core/utils/Types"

export type IdEntry = {
   qualifiedName: string
   id: string
}

export class TestUidWarden implements IUidWarden {
   idMap: Map<QualifiedObjectType, IdEntry[]> = new Map<QualifiedObjectType, IdEntry[]>()
   idToObjectMap: Map<string, IQualifiedObject> = new Map<string, IQualifiedObject>()
   hexWarden: HexUidWarden   

   constructor() {
      this.hexWarden = new HexUidWarden()
   }
   
   add(type: QualifiedObjectType, qualifiedName: string, id: string): void {
      let found = this.idMap.get(type)

      if(!found) {
         found = new Array<IdEntry>()
         this.idMap.set(type, found)
      }

      found.push({ qualifiedName, id })
   }

   async get(uid: string): Promise<IIDCarrier | undefined> {
      return await this.hexWarden.get(uid)
   }

   async has(uid: string): Promise<boolean> {
      return await this.hexWarden.has(uid)
   }

   async register(uid: string, carrier: IIDCarrier): Promise<void> {
      return this.hexWarden.register(uid, carrier)
   }

   async reserve(uid: string, carrier: IIDCarrier): Promise<void> {
      return this.hexWarden.reserve(uid, carrier)
   }
   
   async generate(context?: UidContext): Promise<string> {
      if(context && context.type && this.idMap.has(context.type)) {
         let array = this.idMap.get(context.type)
         
         if(array) {
            let found = array.find(entry => entry.qualifiedName === context.qualifiedName)

            if(found) {
               return found.id
            }
         }
      }

      return this.hexWarden.generate(context)
   }
}
