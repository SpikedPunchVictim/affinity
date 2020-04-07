export interface INamedObject {
   name: string
}

export class NamedObject implements INamedObject {
   private _name: string = ''

   constructor(name: string) {
      this._name = name
   }

   get name() {
      return this._name
   }

   set name(value) {

   }

   getName() : string {
      return this._name
   }
}