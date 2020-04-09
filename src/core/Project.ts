import { INamespace } from './Namespace'
import { IRequestForChangeSource, RequestForChangeSource } from './RequestForChange'
import { IEventRouter } from './events/EventRouter'
import { IQualifiedObject } from '.'
import { NamespaceCollection, INamespaceCollection } from './collections'
import { INamedObject } from './NamedObject'

export type UseHandler = (events: IEventRouter) => void

interface IProject {
   root: INamespace
   // readonly search: ISearch
   // use(handler: UseHandler): void
   // open(): Promise<boolean>
   // commit(): Promise<boolean>
   // readonly on: IProjectListener
}

export interface IProjectContext {
   rfcSource: IRequestForChangeSource
}

class ProjectContext implements IProjectContext {
   rfcSource: IRequestForChangeSource

   constructor(rfcSource?: IRequestForChangeSource) {
      this.rfcSource = rfcSource || new RequestForChangeSource()
   }
}

class RootNamespace implements INamespace {
   context: IProjectContext
   children: INamespaceCollection
   // models: IModelCollection
   // instances: IInstanceCollection

   readonly name: string = ''
   readonly qualifiedName: string = ''
   readonly parent: INamespace | null = null

   constructor(context: IProjectContext) {
      this.context = context
      this.children = new NamespaceCollection(this, context)
   }

   move(name: string): Promise<IQualifiedObject> {
      throw new Error(`Cannot move the Root Namespace`)
   }

   rename(name: string) : Promise<INamedObject> {
      throw new Error(`Cannot rename the Root Namespace`)
   }
}

export interface IProjectOptions {
   rfcSource?: IRequestForChangeSource
}


export class Project implements IProject {
   public root: INamespace
   readonly context: IProjectContext

   constructor(options?: IProjectOptions) {
      this.context = new ProjectContext(options?.rfcSource)
      this.root = new RootNamespace(this.context)
   }

}