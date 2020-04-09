// import { RequestForChange } from './RequestForChange'
import { INamedObject, NamedObject } from './NamedObject'
import { INamespace } from './Namespace'
import { ArgumentError } from '../errors/ArgumentError'

export interface IQualifiedObject extends INamedObject {
   readonly qualifiedName: string
   readonly parent: INamespace | null
   move(name: string): Promise<IQualifiedObject>
}

export class QualifiedObject extends NamedObject {
   get qualifiedName(): string {
      var results = new Array<string>()

      results.push(this.name)

      let current: INamespace | null = this.parent

      while (current != null) {
         if (current.name.length > 0) {
            results.unshift(current.name)
         }

         current = current.parent
      }

      return results.join('.')
   }

   get parent(): INamespace {
      return this._parent
   }

   private _parent: INamespace

   constructor(parent: INamespace, name: string) {
      super(name)

      if (parent == null) {
         throw new ArgumentError(`parent must be valid`)
      }

      this._parent = parent
   }

   move(name: string): Promise<IQualifiedObject> {
      return Promise.resolve(this)
   }
}
