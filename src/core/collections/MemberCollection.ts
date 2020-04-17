import {
   IMember,
   IModel,
   IProjectContext,
   IValue,
   Member
} from '../'

import { BatchedActions } from '../actions/Actions'
import { MemberCreateAction } from '../actions/Model'
import { NamedCollection, INamedCollection } from './NamedCollection'

export type MemberParameters = {
   name: string,
   value: IValue
}

export interface IMemberCollection extends INamedCollection<IMember> {
   readonly model: IModel
   create(name: string, value: IValue): Promise<IMember>
   createMany(params: Array<MemberParameters>): Promise<Array<IMember>>
}

export class MemberCollection extends NamedCollection<IMember> {
   readonly model: IModel
   readonly context: IProjectContext

   constructor(model: IModel, context: IProjectContext) {
      super()
      this.model = model
      this.context = context
   }

   async create(name: string, value: IValue): Promise<IMember> {
      let member = new Member(name, value)

      await this.context.rfc.create(new MemberCreateAction(member))
         .fulfill(async () => {
            await this.add(member, { ignoreChangeRequest: true })
            return
         })
         .commit()

      return Promise.resolve(member)
   }

   async createMany(params: Array<MemberParameters>): Promise<Array<IMember>> {
      let actions = new Array<MemberCreateAction>()
      let members = new Array<IMember>()

      for(let param of params) {
         let member = new Member(param.name, param.value)
         actions.push(new MemberCreateAction(member))
         members.push(member)
      }

      await this.context.rfc.create(new BatchedActions(actions))
         .fulfill(async (acts) => {
            await this.add(members, { ignoreChangeRequest: true })
            return
         })
         .reject((actions, err) => {
            throw new Error(`Failed to create Members. Reason: ${err}`) 
         })
         .commit()
      
      return members
   }
}