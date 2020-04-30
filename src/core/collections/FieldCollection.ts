import {
   IField,
   IInstance,
   IMember,
   IProjectContext } from "..";

import { NamedCollection, INamedCollection } from './NamedCollection';
import { IOrchestrator } from '../Orchestrator';
import { NotSupportedError } from '../../errors/NotSupportedError';

export interface IFieldCollection extends INamedCollection<IField> {
   readonly parent: IInstance

   // Note: May need a create that takes a Model
   // ie: sync(model) Creates the Fields at the same index. Updates any that are missing or may have moved
   // 
   create(members: IMember | Array<IMember>): Promise<Array<IField>>
}

export class FieldCollection 
   extends NamedCollection<IField> 
   implements IFieldCollection {

   readonly parent: IInstance
   readonly context: IProjectContext

   get orchestrator(): IOrchestrator {
      return this.context.orchestrator
   }

   constructor(parent: IInstance, context: IProjectContext) {
      super()
      this.parent = parent
      this.context = context
   }

   async create(members: IMember | Array<IMember>): Promise<Array<IField>> {
      return this.orchestrator.createFields(this.parent, members)
   }

   insert(index: number, item: IField): Promise<boolean> {
      throw new NotSupportedError(`insert is not supported on FieldCollection`)
   }
}