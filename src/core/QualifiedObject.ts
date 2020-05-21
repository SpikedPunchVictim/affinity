import { INamedObject, NamedObject } from './NamedObject'
import { INamespace } from './Namespace'
import { IProjectContext } from './Project'
import { ArgumentError } from '../errors/'
import { IOrchestrator } from './Orchestrator'
import { Events } from './Events'
import { EventEmitter } from 'events'
import { ParentChangeAction } from './actions/QualifiedObject'

export interface IQualifiedObject extends INamedObject, EventEmitter {
   readonly id: string
   readonly qualifiedName: string
   readonly parent: INamespace | null
   attach(parent: INamespace, context: IProjectContext): void
   move(to: INamespace): Promise<IQualifiedObject>
   merge(other: IQualifiedObject): void
}

export class QualifiedObject
   extends NamedObject
   implements IQualifiedObject {

   readonly id: string
   private _context: IProjectContext

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

   get context(): IProjectContext {
      return this._context
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

   constructor(name: string, parent: INamespace, context: IProjectContext, id: string) {
      super(name)

      if (id == null) {
         throw new ArgumentError(`id must be valid`)
      }

      if (parent == null) {
         throw new ArgumentError(`parent must be valid`)
      }

      this.id = id
      this._context = context
      this._parent = parent
   }

   attach(parent: INamespace, context: IProjectContext): void {
      this.setParent(parent)
      this._context = context
   }


   async rename(name: string): Promise<INamedObject> {
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
      let change = new ParentChangeAction(this, this._parent, parent)
      this.emit(Events.QualifiedObject.ParentChanging, change)
      this._parent = parent
      this.emit(Events.QualifiedObject.ParentChanged, change)
   }

   setName(name: string): void {
      this._name = name
   }

   merge(other: IQualifiedObject): void {
      if (other.id !== this.id) {
         throw new ArgumentError(`The ids must be the same`)
      }
   }
}
