import { IProjectContext } from './Project'
import { ArgumentError } from '../errors/'
import { IOrchestrator } from './orchestrator/Orchestrator'
import { Events } from './Events'
import { EventEmitter } from 'events'
import { QualifiedObjectType, Switch } from './utils'
import { IIDCarrier } from './UidWarden'
import { NamespaceRenameAction, NamespaceMoveAction } from './actions/Namespace'
import { ModelRenameAction, ModelMoveAction } from './actions/Model'
import { InstanceMoveAction, InstanceRenameAction } from './actions/Instance'
import { INamedObject, NamedObject } from './NamedObject'
import { INamespace } from './Namespace'

export interface IQualifiedObject extends INamedObject, EventEmitter {
   readonly id: string
   readonly qualifiedName: string
   readonly type: QualifiedObjectType
   readonly parent: INamespace | null
   attach(parent: INamespace, context: IProjectContext): void
   move(to: INamespace): Promise<IQualifiedObject>
   update(): Promise<void>
}

export class QualifiedObject
   extends NamedObject
   implements IQualifiedObject, IIDCarrier {

   readonly id: string
   readonly type: QualifiedObjectType

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

   constructor(name: string, parent: INamespace, type: QualifiedObjectType, context: IProjectContext, id: string) {
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
      this.type = type
   }

   attach(parent: INamespace, context: IProjectContext): void {
      this.setParent(parent)
      this._context = context
   }


   async rename(name: string): Promise<INamedObject> {
      if(name === this.name) {
         return this
      }

      return this.orchestrator.rename(this, name)
   }

   async move(to: INamespace): Promise<IQualifiedObject> {
      return this.orchestrator.move(this, to)
   }

   async update(): Promise<void> {
      return this.orchestrator.updateQualifiedObject(this)
   }

   /**
    * Orphans the QulifiedObject
    */
   orphan(): void {
      this._parent = null
      this._name = '@rphaned'
   }

   setParent(parent: INamespace): void {
      if(this.parent && this.parent.id === parent.id) {
         return
      }

      //@ts-ignore
      let change = Switch.case(this, {
         //@ts-ignore
         Namespace: (ns) => new NamespaceMoveAction(ns, ns.parent, parent),
         //@ts-ignore
         Model: (model) => new ModelMoveAction(model, model.parent, parent),
         //@ts-ignore
         Instance: (inst) => new InstanceMoveAction(inst, inst.parent, parent)
      })

      this.emit(Events.QualifiedObject.ParentChanging, change)
      this._parent = parent
      this.emit(Events.QualifiedObject.ParentChanged, change)
   }

   setName(name: string): void {
      if(this.name === name) {
         return
      }
      
      let action = Switch.onType(this.type, {
         //@ts-ignore
         Namespace: () => new NamespaceRenameAction(this, this.name, name),
         //@ts-ignore
         Model: () => new ModelRenameAction(this, this.name, name),
         //@ts-ignore
         Instance: () => new InstanceRenameAction(this, this.name, name)
      })

      this.emit(Events.QualifiedObject.NameChanging, action)
      this._name = name
      this.emit(Events.QualifiedObject.NameChanged, action)
   }
}
