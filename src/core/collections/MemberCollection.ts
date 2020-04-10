import { ObservableCollection } from "./ObservableCollection";
import { IMember, Member } from "../Member";
import { IValue } from "../Value";
import { IModel } from "../Model";
import { IProjectContext } from "../Project";
import { IRfcAction, BatchedActions } from "../RequestForChange";

export type MemberParameters = {
   name: string,
   value: IValue
}

export class MemberCreateAction implements IRfcAction {
   readonly type: string = 'member-create'
   readonly member: IMember

   constructor(member: IMember) {
      this.member = member
   }
}


export interface IMemberCollection {
   readonly model: IModel
   create(name: string, value: IValue): Promise<IMember>
   createMany(params: Array<MemberParameters>): Promise<Array<IMember>>
}

export class MemberCollection extends ObservableCollection<IMember> {
   readonly model: IModel
   readonly context: IProjectContext

   constructor(model: IModel, context: IProjectContext) {
      super()
      this.model = model
      this.context = context
   }

   async create(name: string, value: IValue): Promise<IMember> {
      let member = new Member(name, value)
      let rfc = this.context.rfcSource.create(new MemberCreateAction(member))

      rfc.fulfill(action => this.add(member))
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

      let rfc = this.context.rfcSource.create(new BatchedActions(actions))

      await rfc
         .fulfill(acts => {
            super.add(...members)
         })
         .reject((actions, err) => {
            throw new Error(`Failed to create Members. Reason: ${err}`) 
         })
         .commit()
      
      return members
   }
}