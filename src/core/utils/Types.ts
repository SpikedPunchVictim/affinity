import { IQualifiedObject } from "../QualifiedObject";
import { INamespace } from "../Namespace";
import { IModel } from "../Model";
import { IInstance } from "../Instance";
import { UnsupportedError } from "../../errors/UnsupportedError";
import { IObservableCollection } from "../collections";
import { IType, IValue } from "../values/Value";

export type QualifiedObjectHandler<TParam, TResult> = (obj: TParam) => TResult

export type QualifiedObjectMap<TResult> = {
   Instance: QualifiedObjectHandler<IInstance, TResult>
   Model: QualifiedObjectHandler<IModel, TResult>
   Namespace: QualifiedObjectHandler<INamespace, TResult>
}

export type QualifiedTypeMap<TResult> = {
   Instance: QualifiedObjectHandler<QualifiedObjectType, TResult>
   Model: QualifiedObjectHandler<QualifiedObjectType, TResult>
   Namespace: QualifiedObjectHandler<QualifiedObjectType, TResult>
}

export enum QualifiedObjectType {
   None = 'None',
   Namespace = 'Namespace',
   Model = 'Model',
   Instance = 'Instance'
}

export function getType(obj: IQualifiedObject): QualifiedObjectType {
   return Switch.case(obj, {
      Namespace: () => QualifiedObjectType.Namespace,
      Model: () => QualifiedObjectType.Model,
      Instance: () => QualifiedObjectType.Instance
   })
}

export class Switch {
   /**
    * Provides a simpler switch/case for QualifiedObjects
    * 
    * @param obj A QualifiedObject or one of the QualifiedObjectType enum
    * @param map A functional mapping to the code to switch to
    */
   static case<TReturn>(obj: IQualifiedObject, map: QualifiedObjectMap<TReturn>): TReturn {
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

   static onType<TReturn>(type: QualifiedObjectType, map: QualifiedTypeMap<TReturn>): TReturn {
      switch(type) {
         case QualifiedObjectType.Namespace: {
            return map.Namespace(type) as TReturn
         }
         case QualifiedObjectType.Model: {
            return map.Model(type) as TReturn
         }
         case QualifiedObjectType.Instance: {
            return map.Instance(type) as TReturn
         }
         default: {
            throw new Error(`Unsupported QualifiedObject Type`)
         }
      }
   }
}

export function isNamespace(obj: IQualifiedObject): obj is INamespace {
   return (obj as INamespace).namespaces !== undefined
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

export function asValue<TValue extends IValue>(value: IValue): TValue {
   return value as TValue
}

export function asType<TType extends IType>(type: IType): TType {
   return type as TType
}

/**
 * Creates a sort function with custom weighted values
 * 
 * @param map A QualifiedObjectMap that assigns weighted values used when sorting
 */
export function sortByType(map: QualifiedObjectMap<number>): (a: IQualifiedObject, b: IQualifiedObject) => number {
   let assign = (obj: IQualifiedObject): number => {
      return Switch.case(obj, map)
   }

   return (a: IQualifiedObject, b: IQualifiedObject): number => {
      let aValue = assign(a)
      let bValue = assign(b)
      return aValue - bValue
   }
}