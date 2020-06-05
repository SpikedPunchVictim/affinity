import { IProjectContext } from "../Project"
import { IOrchestrator } from "./Orchestrator"
import { IUidWarden } from "../UidWarden"
import { IModel } from "../Model"
import { IValue } from "../values/Value"
import { IMember, Member } from "../Member"

export class ComposerCreate {
   readonly context: IProjectContext

   get orchestrator(): IOrchestrator {
      return this.context.orchestrator
   }

   get uidWarden(): IUidWarden {
      return this.context.uidWarden
   }

   constructor(context: IProjectContext) {
      this.context = context
   }

   member(model: IModel, name: string, value: IValue, id: string): IMember {
      let member = new Member(model, name, value.clone(), this.orchestrator, id)
      return member
   }
}