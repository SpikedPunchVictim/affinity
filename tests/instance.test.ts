import 'mocha'
import { expect } from 'chai'
import { fill } from './utils/create'
import { QualifiedObjectType } from '../src/core/utils'
import { INamespace } from '../src/core/Namespace'
import { validateQualifiedPath } from './utils/validate'

describe('Instances', function() {
   it('Can be created', async function() {
      let project = await fill({
         namespaces: [
            'one'
         ]
      })

      let one = await project.get<INamespace>(QualifiedObjectType.Namespace, 'one')
      //@ts-ignore
      let model = await one.models.create('model')
      //@ts-ignore
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
         //@ts-ignore
         let model = await one.models.create('model')
         //@ts-ignore
         let inst = await one.instances.create('inst', model)

         expect(model.members).to.have.lengthOf(0)
         expect(inst.fields).to.have.lengthOf(0)

         await model.members.append({
            name: 'string',
            index: 3,
            negative: -3,
            bool: false
         })

         expect(model.members).to.have.lengthOf(4)
         expect(inst.fields).to.have.lengthOf(4)
      })

      it('Fields are created when Members are created', async function() {
         let project = await fill({
            namespaces: [
               'one'
            ],
            instances: [
               'one.two'
            ]
         })
   
         //let one = await project.get<INamespace>(QualifiedObjectType.Namespace, 'one')
         //@ts-ignore
         let model = await project.get<IModel>(QualifiedObjectType.Model, 'one.two')
         //@ts-ignore
         let inst = await project.get<IInstance>(QualifiedObjectType.Instance, 'one.two')

         expect(model.members).to.have.lengthOf(0)
         expect(inst.fields).to.have.lengthOf(0)

         await model.members.append({
            name: 'string',
            index: 3,
            negative: -3,
            bool: false
         })

         expect(model.members).to.have.lengthOf(4)
         expect(inst.fields).to.have.lengthOf(4)

         await inst.update()
      })

      // it('Fields are merged together correctly when updated', function() {

      // })
   })
})