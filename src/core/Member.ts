import { INamedObject, NamedObject } from './NamedObject'
import { IValue } from './values/Value';
import { ArgumentError } from '../errors/ArgumentError';
import { IModel } from './Model';
import { IValueAttachment, ChangeValueHandler } from './values/ValueFactory';
import { IOrchestrator } from './Orchestrator';

export interface IMember extends INamedObject {
   readonly model: IModel
   readonly value: IValue
}

export class Member 
   extends NamedObject
   implements IMember {
   readonly model: IModel
   readonly value: IValue
   readonly orchestrator: IOrchestrator

   private attachment: IValueAttachment

   constructor(model: IModel, name: string, value: IValue, orchestrator: IOrchestrator) {
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

      this.attachment = new MemberValueAttachment(this, this.orchestrator)
      this.value.attach(this.attachment)
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