import 'mocha'
import { expect } from 'chai'
import { fill } from './utils/create'
import { QualifiedObjectType } from '../src/core/utils'
import { INamespace } from '../src/core/Namespace'

describe('Instances', function() {
   it('Can be created', async function() {
      let project = await fill({
         namespaces: [
            'one'
         ]
      })

      let one = await project.get<INamespace>(QualifiedObjectType.Namespace, 'one')
      let model = await one.models.create('model')
      let inst = await one.instances.create('inst', model)

      //@ts-ignore
      validateQualifiedPath(inst, 'one.inst')
      expect(inst).to.exist
   })

   describe('# Fields', function() {
      it('Fields are created when Members are created', async function() {
         let project = await fill({
            namespaces: [
               'one'
            ]
         })
   
         let one = await project.get<INamespace>(QualifiedObjectType.Namespace, 'one')
         let model = await one.models.create('model')
         let inst = await one.instances.create('inst', model)

         expect(model.members).to.have.lengthOf(0)
         expect(inst.fields).to.have.lengthOf(0)

         model.members.add({
            name: 'string',
            
         })
      })

   })
})