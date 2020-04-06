import { IQualifiedObject } from './QualifiedObject'
import { IModel } from './Model'


interface IInstance  extends IQualifiedObject {

}


interface IModelCollection {
   get(name: string): IModel
}

interface IInstanceCollection {

}

interface INamespaceCollection {

}

interface INamespace {
   children: INamespaceCollection
   models: IModelCollection
   instances: IInstanceCollection
}





interface ISearch {

}

interface IProjectListener {
   commit(handler: any): void
   open(handler: any): void
}

interface IModelAccessor extends IQualifiedObjectAccessor<IModel> {

}

interface IInstanceAccessor extends IQualifiedObjectAccessor<IInstance> {

}

interface INamespaceAccessor extends IQualifiedObjectAccessor<INamespace> {

}

interface IQualifiedObjectAccessor<T extends IQualifiedObject> {
   get(name: string): T | undefined
   iter(): IterableIterator<T>
}

interface IProject {
   root: INamespace
   readonly search: ISearch
   models(): IModelAccessor
   instances(): IInstanceAccessor
   namespaces(): INamespaceAccessor
   open(): Promise<boolean>
   commit(): Promise<boolean>
   readonly on: IProjectListener
}

export default class Project implements IProject {
   public root: INamespace

   constructor() {

   }
   
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

}