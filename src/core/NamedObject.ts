import { NotImplementedError } from "../errors/NotImplementedError"

export interface INamedObject {
   readonly name: string
   rename(name: string): Promise<INamedObject>
}

export abstract class NamedObject implements INamedObject {
   get name(): string {
      return this._name
   }

   protected _name: string = ''

   constructor(name: string) {
      this._name = name
   }

   async rename(name: string) : Promise<INamedObject> {
      // Changing of the name is done in child classes
      await this.onRename(name)
      return Promise.resolve(this)
   }

   protected onRename(newName: string): Promise<void> {
      throw new NotImplementedError(`createRenameAction must be implementd inm child classes`)
   }
}