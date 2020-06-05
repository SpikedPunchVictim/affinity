/*
   Creating a separate Search object for these allows consumers to create their
   own Search capabiltiies depending on their backend.

*/
import { IQualifiedObject } from "./QualifiedObject";
import { IModel } from "./Model";
import { IInstance } from "./Instance";
import { INamespace } from "./Namespace";
import { IProject } from "..";

export type SearchVisitHandler<T> = (obj: T) => void
export type SearchFilter<T> = (obj: T) => boolean
/**
 * An internal in-memory search
 */
export class Search {
   readonly project: IProject

   private objectIdCache: Map<string, IQualifiedObject> = new Map<string, IQualifiedObject>()
   
   constructor(project: IProject) {
      this.project = project
   }

   breadthFirst(start: INamespace, visit: SearchVisitHandler<IQualifiedObject>): void {
      let cacheVisit = (obj: IQualifiedObject) => {
         visit(obj)
         this.objectCacheVisit(obj)
      }

      for(let ns of start.namespaces.observable) {
         cacheVisit(ns)
      }

      for(let model of start.models.observable) {
         cacheVisit(model)
      }

      for(let inst of start.instances.observable) {
         cacheVisit(inst)
      }

      for(let ns of start.namespaces.observable) {
         this.breadthFirst(ns, visit)
      }
   }

   findObjectById(id: string): IQualifiedObject | undefined {
      let found = this.objectIdCache.get(id)

      if(found) {
         return found
      }

      let cacheVisit = (obj: IQualifiedObject): boolean => {
         this.objectCacheVisit(obj)
         
         if(obj.id === id) {
            return true
         }

         return false
      }

      return this.visitUntil(this.project.root, cacheVisit)
   }

   visitUntil(start: INamespace, predicate: SearchFilter<IQualifiedObject>): IQualifiedObject | undefined {
      if(predicate(start)) {
         return start
      }
      
      for(let ns of start.namespaces.observable) {
         if(predicate(ns)) {
            return ns
         }
      }

      for(let model of start.models.observable) {
         if(predicate(model)) {
            return model
         }
      }

      for(let inst of start.instances.observable) {
         if(predicate(inst)) {
            return inst
         }
      }

      for(let ns of start.namespaces.observable) {
         let result = this.visitUntil(ns, predicate)
         if(result !== undefined) {
            return result
         }
      }

      return undefined
   }

   private objectCacheVisit(obj: IQualifiedObject): void {
      this.objectIdCache.set(obj.id, obj)
   }
}

export interface IModelAccessor extends IQualifiedObjectAccessor<IModel> {

}

export interface IInstanceAccessor extends IQualifiedObjectAccessor<IInstance> {

}

export interface INamespaceAccessor extends IQualifiedObjectAccessor<INamespace> {

}

export interface IQualifiedObjectAccessor<T extends IQualifiedObject> {
   get(name: string): T | undefined
   iter(): IterableIterator<T>
}

export interface ISearch {
   // models: IModelAccessor
   // instances: IInstanceAccessor
   // namespaces: INamespaceAccessor
   find<T extends IQualifiedObject>(qualifiedName: string): Promise<T>
   findAll<T extends IQualifiedObject>(pattern: string): Promise<Array<T>>
}

// export class Search implements ISearch {
//    readonly project: IProject

//    constructor(project: IProject) {
//       this.project = project
//    }

//    findAll<T extends IQualifiedObject>(pattern: string): Promise<Array<T>> {
//       //@ts-ignore
//       if(pattern = null) {
//          throw new ArgumentError(`pattern must be valid`)
//       }

//       if(pattern.endsWith('**'))


//    }
// }

/*

   model(path: string): IModel | undefined {
      let tokens = path.split('.')

      let current = this.root

      for(let i = 0; i < tokens.length; ++i) {
         if(i == (tokens.length - 1)) {
            return current.models(tokens[i])
         } else {
            current = current.children.get(tokens[i])
         }
      }

      return undefined
   }

*/