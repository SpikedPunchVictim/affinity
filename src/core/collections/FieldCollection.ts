import { FieldCreateAction } from '../actions/Instance'
import { BatchedActions } from '../actions/Actions'

import {
   IField,
   Field,
   IInstance,
   IMember,
   IProjectContext } from "..";

import { NamedCollection, INamedCollection } from './NamedCollection';

export interface IFieldCollection extends INamedCollection<IField> {
   readonly parent: IInstance

   // Note: May need a create that takes a Model
   // ie: sync(model) Creates the Fields at the same index. Updates any that are missing or may have moved
   // 
   create(member: IMember): Promise<IMember>
   createMany(members: Array<IMember>): Promise<Array<IField>>
}

export class FieldCollection extends NamedCollection<IField> {
   readonly parent: IInstance
   readonly context: IProjectContext

   constructor(parent: IInstance, context: IProjectContext) {
      super()
      this.parent = parent
      this.context = context
   }

   async create(member: IMember): Promise<IMember> {
      let field = new Field(this.parent, member, member.value.clone())

      await this.context.rfc.create(new FieldCreateAction(field))
         .fulfill(async (action) => {
            await this.add(field, { ignoreChangeRequest: true })
            return
         })
         .commit()

      return Promise.resolve(field)
   }

   async createMany(members: Array<IMember>): Promise<Array<IField>> {
      let actions = new Array<FieldCreateAction>()
      let fields = new Array<IField>()

      for(let member of members) {
         let field = new Field(this.parent, member, member.value.clone())
         actions.push(new FieldCreateAction(field))
         fields.push(field)
      }

      let rfc = this.context.rfc.create(new BatchedActions(actions))

      await rfc
         .fulfill(async (acts) => {
            await this.add(fields, { ignoreChangeRequest: true })
         })
         .reject((actions, err) => {
            throw new Error(`Failed to create Members. Reason: ${err}`) 
         })
         .commit()
      
      return fields
   }
}