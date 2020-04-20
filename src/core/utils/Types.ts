import { IQualifiedObject } from "../QualifiedObject";
import { INamespace } from "../..";
import { IModel } from "../Model";
import { IInstance } from "..";
import { UnsupportedError } from "../../errors/UnsupportedError";
import { IObservableCollection } from "../collections";

export type QualifiedObjectHandler<TParam, TResult> = (obj: TParam) => TResult

export type QualifiedObjectMap<TParam, TResult> = {
   Instance: QualifiedObjectHandler<TParam, TResult>
   Model: QualifiedObjectHandler<TParam, TResult>
   Namespace: QualifiedObjectHandler<TParam, TResult>
}

export enum QualifiedObjectType {
   None = 0,
   Namespace,
   Model,
   Instance
}

export class Switch {
   /**
    * Provides a simpler switch/case for QualifiedObjects
    * 
    * @param obj A QualifiedObject or one of the QualifiedObjectType enum
    * @param map A functional mapping to the code to switch to
    */
   static case<TReturn>(obj: IQualifiedObject, map: QualifiedObjectMap<IQualifiedObject, TReturn>): TReturn {
      if(isNamespace(obj)) {
         return map.Namespace(obj)
      }

      if(isModel(obj)) {
         return map.Model(obj)
      }

      if(isInstance(obj)) {
         return map.Instance(obj)
      }

      throw new UnsupportedError(`Unsupported QualifiedObject type encountered in Switch.case()`)
   }

   static onType<TReturn>(type: QualifiedObjectType, map: QualifiedObjectMap<void, TReturn>): TReturn {
      switch(type) {
         case QualifiedObjectType.Namespace: {
            return map.Namespace()
         }
         case QualifiedObjectType.Model: {
            return map.Model()
         }
         case QualifiedObjectType.Instance: {
            return map.Instance()
         }
         default: {
            throw new Error(`Unsupported QualifiedObject Type`)
         }
      }
   }
}

export function isNamespace(obj: IQualifiedObject): obj is INamespace {
   return (obj as INamespace).children !== undefined
}

export function isModel(obj: IQualifiedObject): obj is IModel {
   return (obj as IModel).members !== undefined
}

export function isInstance(obj: IQualifiedObject): obj is IInstance {
   return (obj as IInstance).fields !== undefined
}

export function as<TResult extends IQualifiedObject>(obj: IQualifiedObject): TResult {
   return obj as TResult
}

export function asCollection<T, TResult extends IObservableCollection<T>>(collection: IObservableCollection<T>): TResult {
   return collection as TResult
}