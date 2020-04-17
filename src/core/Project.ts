import { 
   basename,
   parentPath,
   QualifiedObjectType,
   Switch } from './utils'

import { IRequestForChangeSource, RequestForChangeSource } from './actions/RequestForChange'
import { INamespace, RootNamespace } from './Namespace'
import { IQualifiedObject } from './QualifiedObject'
import { IPlugin } from './plugins/Plugin'
import { ActionRouter, IActionRouter } from './actions/ActionRouter'
import { ProjectOpen, ProjectCommit } from './actions/Project'
import { ArgumentError } from '../errors/ArgumentError'
import { InvalidOperationError } from '../errors/InvalidOperationError'

export interface IProjectContext {
   readonly rfc: IRequestForChangeSource
   readonly router: IActionRouter
   readonly project: IProject
}

class ProjectContext implements IProjectContext {
   get rfc(): IRequestForChangeSource {
      return this.project.rfc
   }

   get router(): IActionRouter {
      return this.project.router
   }

   readonly project: IProject

   constructor(project: IProject) {
      this.project = project
   }
}

export interface IProjectOptions {
   rfcSource?: IRequestForChangeSource
}

export interface IProject {
   readonly root: INamespace
   readonly router: IActionRouter
   readonly rfc: IRequestForChangeSource

   /**
    * Retrieves the QualifiedObject athe the provided qualified path, or undefined if not found.
    * 
    * @param qualifiedType The type to retrieve
    * @param qualifiedPath The qualified path
    */
   get<TReturn extends IQualifiedObject>(qualifiedType: QualifiedObjectType, qualifiedPath: string): Promise<TReturn | undefined>
   
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
   use(plugin: IPlugin): Promise<void>
   open(): Promise<void>
   commit(): Promise<void>
}

export class Project implements IProject {
   readonly root: INamespace
   readonly context: IProjectContext
   readonly router: IActionRouter
   readonly rfc: IRequestForChangeSource

   constructor(options?: IProjectOptions) {
      this.router = new ActionRouter()
      this.rfc = options?.rfcSource || new RequestForChangeSource(this.router)
      this.context = new ProjectContext(this)
      this.root = new RootNamespace(this.context)
   }

   open(): Promise<void> {
      return this.router.raise(new ProjectOpen(this))
   }

   commit(): Promise<void> {
      return this.router.raise(new ProjectCommit(this))
   }

   get<TReturn extends IQualifiedObject>(qualifiedType: QualifiedObjectType, qualifiedPath: string): Promise<TReturn | undefined> {
      if(qualifiedPath == null) {
         throw new ArgumentError(`qualifiedPath must be valid when calling Project.get()`)
      }
      
      if(qualifiedPath === '' && qualifiedType === QualifiedObjectType.Namespace) {
         // Note: For Typescript, must convert to parent class before returning as TResult
         let result = this.root as IQualifiedObject
         return Promise.resolve(result as TReturn)
      }
      
      let parentQPath = parentPath(qualifiedPath)

      if(parentQPath === undefined) {
         return Promise.resolve(undefined)
      }

      let current: INamespace | undefined = this.root

      let tokens = parentQPath
         .split('.')
         .filter(it => it !== '')

      for(let token of tokens) {
         current = current.children.get(token)

         if(current === undefined) {
            return Promise.resolve(undefined)
         }
      }

      // current is the Parent Namespace at this point
      let baseQPath = basename(qualifiedPath)

      let result = Switch.onType<IQualifiedObject | undefined>(qualifiedType, {
         Namespace: () => current?.children.get(baseQPath),
         Model: () => current?.models.get(baseQPath),
         Instance: () => current?.instances.get(baseQPath)
      })

      return result === undefined ?
         Promise.resolve(undefined) :
         Promise.resolve(result as TReturn)
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

      return Switch.onType(qualifiedType, {
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

   async use(plugin: IPlugin): Promise<void> {
      plugin.setup(this, this.router)
   }

}