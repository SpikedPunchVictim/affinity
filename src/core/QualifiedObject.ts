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
      let results = new Array<string>()

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

   get parent(): INamespace | null {
      return this._parent
   }

   get rfc() {
      return this.context.rfc
   }

   get orchestrator(): IOrchestrator {
      return this.context.orchestrator
   }

   readonly context: IProjectContext

   private _parent: INamespace | null

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
   }

   /**
    * Orphans the QulifiedObject
    */
   orphan(): void {
      this._parent = null
      this._name = '@rphaned'
   }

   setParent(parent: INamespace): void {
      this._parent = parent
   }

   setName(name: string): void {
      this._name = name
   }
}
