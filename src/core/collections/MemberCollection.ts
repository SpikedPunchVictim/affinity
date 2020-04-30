import {
   IMember,
   IModel,
   IProjectContext,
   IValue
} from '../'

import { NamedCollection, INamedCollection } from './NamedCollection'
import { IOrchestrator } from '../Orchestrator'

export type MemberParameters = {
   name: string,
   value: IValue
}

export interface IMemberCollection extends INamedCollection<IMember> {
   readonly model: IModel
   create(params: MemberParameters | Array<MemberParameters>): Promise<Array<IMember>>
}

export class MemberCollection extends NamedCollection<IMember> {
   readonly model: IModel
   readonly context: IProjectContext

   get orchestrator(): IOrchestrator {
      return this.context.orchestrator
   }

   constructor(model: IModel, context: IProjectContext) {
      super()
      this.model = model
      this.context = context
   }

   create(params: MemberParameters | Array<MemberParameters>): Promise<Array<IMember>> {
      return this.orchestrator.createMembers(this.model, params)
   }
}