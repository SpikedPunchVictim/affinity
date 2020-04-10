import { 
   IEventRouter,
   INamedObject,
   INamespace,
   IQualifiedObject,
   IRequestForChangeSource,
   RequestForChangeSource } from '.'

import { 
   basename,
   parentPath,
   QualifiedObjectType,
   Switch } from './utils'

import {
   IInstanceCollection,
   IModelCollection,
   InstanceCollection,
   ModelCollection,
   NamespaceCollection,
   INamespaceCollection } from './collections'

export type UseHandler = (events: IEventRouter) => void

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
   models: IModelCollection
   instances: IInstanceCollection

   readonly name: string = ''
   readonly qualifiedName: string = ''
   readonly parent: INamespace | null = null

   constructor(context: IProjectContext) {
      this.context = context
      this.children = new NamespaceCollection(this, context)
      this.models = new ModelCollection(this, this.context)
      this.instances = new InstanceCollection(this, this.context)
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

interface IProject {
   root: INamespace

   get(qualifiedType: QualifiedObjectType, qualifiedPath: string): Promise<IQualifiedObject | undefined>
   // create<T extends IQualifiedObject>(qualifiedPath: string): Promise<T>
   // delete<T extends IQualifiedObject>(qualifiedPath: string): Promise<void>
   // move<T extends IQualifiedObject>(fromPath: string, toPath: string): Promise<T>
   // readonly search: ISearch
   // use(handler: UseHandler): void
   // open(): Promise<boolean>
   // commit(): Promise<boolean>
   // readonly on: IProjectListener
}

export class Project implements IProject {
   public root: INamespace
   readonly context: IProjectContext

   constructor(options?: IProjectOptions) {
      this.context = new ProjectContext(options?.rfcSource)
      this.root = new RootNamespace(this.context)
   }

   get(qualifiedType: QualifiedObjectType, qualifiedPath: string): Promise<IQualifiedObject | undefined> {
      let parentQPath = parentPath(qualifiedPath)

      if(parentQPath === undefined) {
         return Promise.resolve(undefined)
      }

      let current: INamespace | undefined = this.root
      let tokens = parentQPath.split('.')

      for(let token of tokens) {
         current = current.children.get(token)

         if(current === undefined) {
            return Promise.resolve(undefined)
         }
      }

      // current is the Parent Namespace at this point
      let baseQPath = basename(qualifiedPath)

      let result = Switch.case<IQualifiedObject | undefined>(qualifiedType, {
         Namespace: () => current?.children.get(baseQPath),
         Model: () => current?.models.get(baseQPath),
         Instance: () => current?.instances.get(baseQPath)
      })

      return result === undefined ?
         Promise.resolve(undefined) :
         Promise.resolve(result)
   }

   // create<T extends IQualifiedObject>(qualifiedPath: string): Promise<T> {

   // }

   // delete<T extends IQualifiedObject>(qualifiedPath: string): Promise<void> {

   // }
   
   // move<T extends IQualifiedObject>(fromPath: string, toPath: string): Promise<T> {

   // }

}