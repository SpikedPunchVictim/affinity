export interface INamedObject {
   readonly name: string
   rename(name: string): Promise<INamedObject>
}

export class NamedObject implements INamedObject {
   readonly name: string = ''

   constructor(name: string) {
      this.name = name
   }

   rename(name: string) : Promise<INamedObject> {
      return Promise.resolve(this)
   }
}