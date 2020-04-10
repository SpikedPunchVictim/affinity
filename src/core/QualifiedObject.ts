// import { RequestForChange } from './RequestForChange'
import { 
   INamedObject,
   INamespace,
   IProjectContext,
   NamedObject } from '.'

import { ArgumentError } from '../errors/'
import { ParentChangeAction } from './Actions'

export interface IQualifiedObject extends INamedObject {
   readonly qualifiedName: string
   readonly parent: INamespace | null
   move(to: INamespace): Promise<IQualifiedObject>
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

   get rfc() {
      return this.context.rfcSource
   }

   readonly context: IProjectContext

   private _parent: INamespace

   constructor(parent: INamespace, name: string, context: IProjectContext) {
      super(name)

      if (parent == null) {
         throw new ArgumentError(`parent must be valid`)
      }

      this.context = context
      this._parent = parent
   }

   async move(to: INamespace): Promise<IQualifiedObject> {
      // TODO: Validate move
      let rfc = this.context.rfcSource.create(new ParentChangeAction(this, this.parent, to))
      
      await rfc
         .fulfill(action => this._parent = to)
         .commit()
      
      return this
   }
}
