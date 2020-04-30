/*
   Creating a separate Search object for these allows consumers to create their
   own Search capabiltiies depending on their backend.

*/
import { IQualifiedObject } from "./QualifiedObject";
import { IModel } from "./Model";
import { IInstance } from "./Instance";
import { INamespace } from "./Namespace";

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