import { RequestForChange } from './RequestForChange'

export interface IQualifiedObject {
   readonly name: string
   readonly path: string
   setName(name: string): Promise<IQualifiedObject>
   setPath(name: string): Promise<IQualifiedObject>
}

export class QualifiedObject implements IQualifiedObject {
   get name(): string {
      return this._name
   }

   get path(): string {
      return this._path
   }

   private _name: string = ""
   private _path: string = ""

   constructor() {
      
   }

   setName(name: string): Promise<IQualifiedObject> {

   }

   setPath(name: string): Promise<IQualifiedObject> {

   }
}
