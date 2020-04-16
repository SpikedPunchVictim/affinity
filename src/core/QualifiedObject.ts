// import { RequestForChange } from './RequestForChange'
import { NamedObject } from './NamedObject'

import { 
   INamedObject,
   INamespace,
   IProjectContext, 
   IModel,
   IInstance} from '.'

import { ArgumentError } from '../errors/'
import { ParentChangeAction } from './actions/QualifiedObject'
import { QualifiedObjectType, Switch, as } from './utils'
import { NameCollisionError } from '../errors/NameCollisionError'

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
      return this.context.rfc
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
      let found = await this.context.project.get(QualifiedObjectType.Namespace, to.qualifiedName)
      
      if(!found) {
         throw new ArgumentError(`The 'to' Namespace provided to move() doesn't exist in this project`)
      }

      // Is there a QualifiedObject with that name already at the destination?
      let exists = Switch.case<boolean>(this, {
         Namespace: obj => to.children.get(this.name) !== undefined,
         Model: obj => to.models.get(this.name) !== undefined,
         Instance: obj => to.instances.get(this.name) !== undefined
      })

      if(exists) {
         throw new NameCollisionError(`A QualifiedObject with that name already exists in the target location`)
      }
      
      let self = this
      await this.rfc.create(new ParentChangeAction(this, this.parent, to))
         .fulfill(action => {
            Switch.case(this, {
               Namespace: async (obj) => {
                  await self.parent.children.remove(as<INamespace>(self))
                  await to.children.add(as<INamespace>(self))
               },
               Model: async (obj) => {
                  await self.parent.models.remove(as<IModel>(self))
                  await to.models.add(as<IModel>(self))
               },
               Instance: async (obj) => {
                  await self.parent.instances.remove(as<IInstance>(self))
                  await to.instances.add(as<IInstance>(self))
               }
            })
         })
         .commit()
      
      return this
   }

   setParent(parent: INamespace): void {
      this._parent = parent
   }

   /**
    * Convert this QualifiedObject into an orphaned object, no longer a part
    * of the project
    */
   protected orphan(): void {

   }
}
