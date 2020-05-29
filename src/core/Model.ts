import { IQualifiedObject, QualifiedObject } from './QualifiedObject'
import { INamespace } from './Namespace';
import { MemberCollection, IMemberCollection } from './collections/MemberCollection';
import { IProjectContext } from './Project';
import { MemberAdd, IMember, MemberRestoreInfo } from './Member';
import { IndexableItem } from './collections/ChangeSets';
import { QualifiedObjectType } from './utils';
import { RestoreInfo } from './Restore'

export class ModelLazyRestoreInfo extends RestoreInfo {
   constructor(
      name: string = "",
      qualifiedName: string = "",
      id: string = "",
      parentId: string = "",
      index: number = -1) {
      super(name, qualifiedName, id, parentId, index)
   }
}

export class ModelFullRestoreInfo extends ModelLazyRestoreInfo {
   members: Array<MemberRestoreInfo> = new Array<MemberRestoreInfo>()

   constructor(
      name: string = "",
      qualifiedName: string = "",
      id: string = "",
      parentId: string = "" ) {
         super(name, qualifiedName, id, parentId)
      }
}

export interface IModel extends IQualifiedObject {
   readonly members: IMemberCollection

   /**
    * Append members to the end of the end of the Model
    * 
    * @param values {ModelEdit} The schema 
    */
   append(values: MemberAdd): Promise<IndexableItem<IMember>[]>

   /**
    * Removes all Members from this Model
    */
   clear(): Promise<boolean>

   /**
    * Removes a Member from the Model
    * @param name The name of the Member to remove
    */
   remove(name: string): Promise<boolean>

   /**
    * Removes a Member, by index, from the Model
    * @param index The index of the Member to remove
    */
   removeAt(index: number): Promise<boolean>
}

export class Model extends QualifiedObject implements IModel {
   readonly members: IMemberCollection

   constructor(name: string, parent: INamespace, context: IProjectContext, id: string) {
      super(name, parent, QualifiedObjectType.Model, context, id)
      this.members = new MemberCollection(this, this.context)
   }

   async append(values: MemberAdd): Promise<IndexableItem<IMember>[]>{
      return this.members.append(values)
   }

   /**
    * Removes all Members from this Model
    */
   async clear(): Promise<boolean> {
      return this.members.clear()
   }

   /**
    * Removes a Member from the Model
    * @param name The name of the Member to remove
    */
   async remove(name: string): Promise<boolean> {
      return this.members.remove(name)
   }

   /**
    * Removes a Member, by index, from the Model
    * @param index The index of the Member to remove
    */
   async removeAt(index: number): Promise<boolean> {
      return this.members.removeAt(index)
   }

   async update(): Promise<void> {
      //this.orchestrator.
      this.orchestrator.updateMembers(this)
   }

   protected async onRename(newName: string): Promise<void> {
      await this.orchestrator.rename(this, newName)
   }
}