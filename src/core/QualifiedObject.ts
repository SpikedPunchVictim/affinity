// import { RequestForChange } from './RequestForChange'
import { NamedObject } from './NamedObject'

import { 
   INamedObject,
   INamespace,
   IProjectContext } from '.'

import { ArgumentError } from '../errors/'
import { IOrchestrator } from './Orchestrator'
import { EventEmitter } from 'events'

export interface IQualifiedObject extends INamedObject, EventEmitter {
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

   get orchestrator(): IOrchestrator {
      return this.context.orchestrator
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

   async rename(name: string) : Promise<INamedObject> {
      return this.orchestrator.rename(this, name)
   }

   async move(to: INamespace): Promise<IQualifiedObject> {
      return this.orchestrator.move(this, to)
      // if(this.parent === to) {
      //    return Promise.resolve(this)
      // }

      // // TODO: Validate move
      // let found = await this.context.project.get(QualifiedObjectType.Namespace, to.qualifiedName)
      
      // if(!found) {
      //    throw new ArgumentError(`The 'to' Namespace provided to move() doesn't exist in this project`)
      // }

      // // Is there a QualifiedObject with that name already at the destination?
      // let exists = Switch.case<boolean>(this, {
      //    Namespace: obj => to.children.get(this.name) !== undefined,
      //    Model: obj => to.models.get(this.name) !== undefined,
      //    Instance: obj => to.instances.get(this.name) !== undefined
      // })

      // if(exists) {
      //    throw new NameCollisionError(`A QualifiedObject with that name already exists in the target location`)
      // }
      
      // await this.rfc.create(new ParentChangeAction(this, this.parent, to))
      //    .fulfill(async (action) => {
      //       let hasMovedOut = false

      //       try {
      //          await this.parent.moveOut(this)
      //          hasMovedOut = true
      //          await to.moveIn(this)
      //       } catch(err) {
      //          // Damage control
      //          if(hasMovedOut) {
      //             await this.parent.moveIn(this)
      //          } else {
      //             throw err
      //          }
      //       }
      //    })
      //    .commit()
      
      // return this
   }

   setParent(parent: INamespace): void {
      this._parent = parent
   }

   setName(name: string): void {
      this._name = name
   }
}
