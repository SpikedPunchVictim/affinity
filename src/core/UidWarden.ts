import { uuid } from "./utils/Uuid";
import { DuplicateUidError } from "../errors/DuplicateUidError";
import { IQualifiedObject } from "./QualifiedObject";
import { IMember } from "./Member";
import { QualifiedObjectType } from "./utils";

export interface IIDCarrier {
   readonly id: string
}

export type UidContext = {
   qualifiedName?: string
   isMember?: boolean
   memberName?: string
   type?: QualifiedObjectType
}

export interface IUidWarden {
   get(uid: string): Promise<IIDCarrier | undefined>
   has(uid: string): Promise<boolean>
   register(uid: string, carrier: IIDCarrier): Promise<void>
   reserve(uid: string, carrier: IIDCarrier): Promise<void>
   generate(context?: UidContext): Promise<string>
}

export class HexUidWarden implements IUidWarden {
   private reserved: Map<string, IIDCarrier>

   constructor(reserved: Array<IIDCarrier>=new Array<IIDCarrier>()) {
      this.reserved = new Map<string, IQualifiedObject | IMember>()
      reserved.forEach(carrier => this.reserved.set(carrier.id, carrier))
   }

   async get(uid: string): Promise<IIDCarrier | undefined> {
      let result = this.reserved.get(uid)

      return result === undefined ? undefined : result
   }

   async has(uid: string): Promise<boolean> {
      return this.reserved.has(uid)
   }

   async register(uid: string, carrier: IIDCarrier): Promise<void> {
      this.reserved.set(uid, carrier)
      return
   }

   async reserve(uid: string, carrier:IIDCarrier): Promise<void> {
      if(this.reserved.has(uid)) {
         throw new DuplicateUidError(uid)
      }

      this.reserved.set(uid, carrier)
   }

   async generate(context?: UidContext): Promise<string> {
      let uid = uuid()
      while(this.reserved.has(uid)) {
         uid = uuid()
      }

      return uid
   }
}