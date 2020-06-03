import { INamedObject, NamedObject } from './NamedObject'
import { IValue } from './values/Value';
import { ArgumentError } from '../errors/ArgumentError';
import { IModel } from './Model';
import { IValueAttachment, ChangeValueHandler } from './values/ValueAttachment';
import { IOrchestrator } from './orchestrator/Orchestrator';
import { RestoreInfo } from './Restore'
import { MemberRenameAction } from './actions/Model';
import { Events } from './Events';

// For use in object literals
export class MemberAdd {
   [key: string]: IValue | any
}

/**
 * Defines data needed to create a MEmber.
 * Contains:
 *    * name {string}
 *    * value {IValue}
 *    * index {number}
 *    * id {string}
 */
export type MemberCreateInfo = {
   name: string
   value: IValue
   index?: number // Unknown/optional during creation time, and assumed to be appended to the end
}

/**
 * Used for restoring a Member from a data store
 */
export class MemberRestoreInfo extends RestoreInfo {
   name: string = ""
   value: IValue
   index: number = -1
   id: string = ""
   modelId: string

   constructor(name: string, value: IValue, id: string, modelId: string, index: number) {
      super(name, "", id, modelId, index)
      this.value = value
      this.modelId = modelId
   }
}

/*
   Only Members have IDs. Fields share their Member IDs.
*/
export interface IMember extends INamedObject {
   readonly model: IModel
   readonly value: IValue
   readonly id: string
}

export class Member 
   extends NamedObject
   implements IMember {
   readonly model: IModel
   readonly value: IValue
   readonly orchestrator: IOrchestrator
   readonly id: string

   private attachment: IValueAttachment

   constructor(model: IModel, name: string, value: IValue, orchestrator: IOrchestrator, id: string) {
      super(name)

      if(model == null) {
         throw new ArgumentError(`model must be valid`)
      }

      if(value == null) {
         throw new ArgumentError(`value must be valid`)
      }

      if(orchestrator == null) {
         throw new ArgumentError(`orchestrator must be valid`)
      }

      this.model = model
      this.value = value
      this.orchestrator = orchestrator
      this.id = id

      this.attachment = new MemberValueAttachment(this, this.orchestrator)
      this.value.attach(this.attachment)
   }

   /**
    * Sets the name. This is used internally to update the name
    * without emitting plugin events
    * 
    * @param name The new name
    */
   setName(name: string): void {
      if(this.name === name) {
         return
      }

      // TODO: Bubble this up?
      let action = new MemberRenameAction(this, this.name, name)
      this.emit(Events.Member.NameChanging, action)
      this._name = name
      this.emit(Events.Member.NameChanged, action)
   }
}

export class MemberValueAttachment implements IValueAttachment {
   readonly member: IMember
   readonly orchestrator: IOrchestrator

   constructor(member: IMember, orchestrator: IOrchestrator) {
      this.member = member
      this.orchestrator = orchestrator
   }

   request(oldValue: IValue, newValue: IValue, changeValue: ChangeValueHandler): Promise<IValue> {
      return this.orchestrator.updateMemberValue(this.member, oldValue, newValue, changeValue)
   }
}