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
import { ArgumentError } from '../errors/ArgumentError'
import { InvalidOperationError } from '../errors'

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

   move(to: INamespace): Promise<IQualifiedObject> {
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

   /**
    * Retrieves the QualifiedObject athe the provided qualified path, or undefined if not found.
    * 
    * @param qualifiedType The type to retrieve
    * @param qualifiedPath The qualified path
    */
   get(qualifiedType: QualifiedObjectType, qualifiedPath: string): Promise<IQualifiedObject | undefined>
   
   /**
    * Creates all fo the Namespaces to complete the path. Returns
    * the last Namespace in the path.
    * 
    * @param qualifiedPath The period delimited qualified path
    */
   create(qualifiedPath: string): Promise<INamespace>

   /**
    * Deletes a Qualified Object at the provided qualified path
    * 
    * @param qualifiedType The QualifiedType
    * @param qualifiedPath The qualified path
    */
   delete(qualifiedType: QualifiedObjectType, qualifiedPath: string): Promise<void>

   /**
    * Moves a QualifiedObject from one place in the Namespace tree to another
    * 
    * @param qualifiedType The QualifiedType to move
    * @param fromPath The qualified path to the original QualifiedObject's location
    * @param toPath The qualified path to the destination
    */
   move(qualifiedType: QualifiedObjectType, fromPath: string, toPath: string): Promise<IQualifiedObject | undefined>
   
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

   async create(qualifiedPath: string): Promise<INamespace> {
      if(!qualifiedPath) {
         throw new ArgumentError(`qualifiedPath must be valid`)
      }

      let current = this.root
      let tokens = qualifiedPath.split('.')

      for(let token of tokens) {
         let child = current.children.get(token)

         current = child === undefined ?
            current = await current.children.create(token) :
            child
      }

      return current
   }

   async delete(qualifiedType: QualifiedObjectType, qualifiedPath: string): Promise<void> {
      let obj = await this.get(qualifiedType, qualifiedPath)

      if(obj === undefined) {
         return Promise.resolve()
      }

      if(obj === this.root) {
         throw new Error(`Cannot delete the Root Namespace`)
      }

      let parent = obj.parent

      if(parent == null) {
         throw new Error(`The QualifiedObject's parent is not valid. Validate the project is in the correct state. This should never happen, and may be a bug with the system.`)
      }

      let baseQName = basename(qualifiedPath)

      return Switch.case(qualifiedType, {
         Namespace: () => parent?.children.delete(baseQName),
         Model: () => parent?.models.delete(baseQName),
         Instance: () => parent?.instances.delete(baseQName)
      })
   }
   
   async move(qualifiedType: QualifiedObjectType, fromPath: string, toPath: string): Promise<IQualifiedObject | undefined> {
      let obj = await this.get(qualifiedType, fromPath)

      if(obj === undefined) {
         return Promise.resolve(undefined)
      }

      let to = await this.get(QualifiedObjectType.Namespace, toPath)

      if(to === undefined) {
         throw new InvalidOperationError(`Cannot move a QualifiedObject to a Namespace that does not exist. Ensure it's created before moving to it.`)
      }

      return await obj.move(to as INamespace)
   }

}