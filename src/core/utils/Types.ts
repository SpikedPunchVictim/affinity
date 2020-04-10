import { IQualifiedObject } from "../QualifiedObject";
import { INamespace } from "../..";
import { IModel } from "../Model";
import { IInstance } from "..";

export type QualifiedObjectHandler<T> = (obj?: IQualifiedObject) => T

export type QualifiedObjectMap<T> = {
   Instance?: QualifiedObjectHandler<T>
   Model?: QualifiedObjectHandler<T>
   Namespace?: QualifiedObjectHandler<T>
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
   static case<TReturn>(obj: IQualifiedObject | QualifiedObjectType, map: QualifiedObjectMap<TReturn>): TReturn | undefined {
      if(typeof(obj) === "number") {
         switch(obj) {
            case QualifiedObjectType.Namespace: {
               return map.Namespace ? map.Namespace() : undefined
            }
            case QualifiedObjectType.Model: {
               return map.Model ? map.Model() : undefined
            }
            case QualifiedObjectType.Instance: {
               return map.Instance ? map.Instance() : undefined
            }
            default: {
               throw new Error(`Unsupported QualifiedObject Type`)
            }
         }

      } else {
         if(isNamespace(obj) && map.Namespace) {
            return map.Namespace(obj)
         }
   
         if(isModel(obj) && map.Model) {
            return map.Model(obj)
         }
   
         if(isInstance(obj) && map.Instance) {
            return map.Instance(obj)
         }
      }

      return undefined
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