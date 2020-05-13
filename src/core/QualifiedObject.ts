import { INamedObject, NamedObject } from './NamedObject'
import { INamespace } from './Namespace'
import { IProjectContext } from './Project'
import { ArgumentError } from '../errors/'
import { IOrchestrator } from './Orchestrator'
import { Events } from './Events'
import { EventEmitter } from 'events'

export class ParentChange {
   readonly oldParent: INamespace
   readonly newParent: INamespace

   constructor(oldParent: INamespace, newParent: INamespace) {
      this.oldParent = oldParent
      this.newParent = newParent
   }
}

export interface IQualifiedObject extends INamedObject, EventEmitter {
   readonly id: string
   readonly qualifiedName: string
   readonly parent: INamespace | null
   move(to: INamespace): Promise<IQualifiedObject>
   merge(other: IQualifiedObject): void
}

export class QualifiedObject extends NamedObject {

   readonly id: string
   readonly context: IProjectContext

   private _parent: INamespace | null

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

   constructor(id: string, parent: INamespace, name: string, context: IProjectContext) {
      super(name)

      if(id == null) {
         throw new ArgumentError(`id must be valid`)
      }

      if (parent == null) {
         throw new ArgumentError(`parent must be valid`)
      }

      this.id = id
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
      //@ts-ignore
      let change = new ParentChange(this._parent, parent)
      this.emit(Events.QualifiedObjectEvents.ParentChanging, change)
      this._parent = parent
      this.emit(Events.QualifiedObjectEvents.ParentChanged, change)
   }

   setName(name: string): void {
      this._name = name
   }

   merge(other: IQualifiedObject): void {
      if(other.id !== this.id) {
         throw new ArgumentError(`The ids must be the same`)
      }
   }
}
