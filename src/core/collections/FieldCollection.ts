import {
   Field,
   FieldCreateAction,
   IField,
   IInstance,
   IMember,
   ObservableCollection,
   IProjectContext,
   BatchedActions } from "..";
import { ArgumentError } from "../../errors/ArgumentError";

export interface IFieldCollection {
   readonly parent: IInstance

   // Note: May need a create that takes a Model
   // ie: sync(model) Creates the Fields at the same index. Updates any that are missing or may have moved
   // 
   create(member: IMember): Promise<IMember>
   createMany(members: Array<IMember>): Promise<Array<IField>>

   get(name: string): IField | undefined
}

export class FieldCollection extends ObservableCollection<IField> {
   readonly parent: IInstance
   readonly context: IProjectContext

   constructor(parent: IInstance, context: IProjectContext) {
      super()
      this.parent = parent
      this.context = context
   }

   async create(member: IMember): Promise<IMember> {
      let field = new Field(this.parent, member, member.value.clone())

      let rfc = this.context.rfcSource.create(new FieldCreateAction(this.parent, field))

      rfc.fulfill(action => this.add(field))
         .commit()

      return Promise.resolve(field)
   }

   async createMany(members: Array<IMember>): Promise<Array<IField>> {
      let actions = new Array<FieldCreateAction>()
      let fields = new Array<IField>()

      for(let member of members) {
         let field = new Field(this.parent, member, member.value.clone())
         actions.push(new FieldCreateAction(this.parent, field))
         fields.push(field)
      }

      let rfc = this.context.rfcSource.create(new BatchedActions(actions))

      await rfc
         .fulfill(acts => {
            super.add(...fields)
         })
         .reject((actions, err) => {
            throw new Error(`Failed to create Members. Reason: ${err}`) 
         })
         .commit()
      
      return fields
   }

   get(name: string): IField | undefined {
      if(name == null) {
         throw new ArgumentError(`name must be valid`)
      }

      return super.find(field => field.name.toLowerCase() === name.toLowerCase())
   }
}