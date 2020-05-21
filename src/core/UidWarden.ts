import { uuid } from "./utils/Uuid";
import { DuplicateUidError } from "../errors/DuplicateUidError";

export interface IUidWarden {
   reserve(uid: string): Promise<void>
   generate(): Promise<string>
}

export class HexUidWarden implements IUidWarden {
   private reserved: Array<string>

   constructor(reserved: Array<string>=new Array<string>()) {
      this.reserved = Array.from(reserved)
   }

   async reserve(uid: string): Promise<void> {
      if(this.reserved.indexOf(uid) >= 0) {
         throw new DuplicateUidError(uid)
      }

      this.reserved.push(uid)
   }

   async generate(): Promise<string> {
      let uid = uuid()
      while(this.reserved.indexOf(uid) >= 0) {
         uid = uuid()
      }

      this.reserved.push(uid)

      return uid
   }
}