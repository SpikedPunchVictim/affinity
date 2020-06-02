import 'mocha'
import { expect } from 'chai'
import { QualifiedObjectType } from '../src/core/utils'
import { INamespace } from '../src/core/Namespace'
import { projectTest } from './utils/test'
import { IInstance } from '../src/core/Instance'

describe('Instances', function () {
   projectTest(
      `Can be created`,
      async (project, { model }) => { },
      async (project) => {
         let ns = await project.create('parent')
         //@ts-ignore
         let mdl = await ns.models.create('newmodel')
         let inst = await ns.instances.create('newinst', mdl)
         //@ts-ignore
         expect(inst).to.not.be.undefined
      }
   )

   projectTest(
      `Can be deleted`,
      async (project, { instance }) => { },
      async (project, { instance }) => {
         expect(instance.instances).to.have.lengthOf(6)
         await instance.instances.delete('one')

         let one = await instance.instances.get('one')
         expect(instance.instances).to.have.lengthOf(5)
         //@ts-ignore
         expect(one).to.be.undefined
      })

   projectTest(
      `Can be renamed`,
      async (project, { instance }) => { },
      async (project, { instance }) => {
         let one = await instance.instances.get('one')
         //@ts-ignore
         await one.rename('seventeen')
         //@ts-ignore
         expect(one.name).to.equal('seventeen')
      }
   )

   projectTest(
      `Can be moved`,
      async (project, { instance }) => {
         await project.create('new-namespace')
      },
      async (project, { instance }) => {
         let one = await instance.instances.get('one')
         let newParent = await project.get<INamespace>(QualifiedObjectType.Namespace, 'new-namespace')
         //@ts-ignore
         await one.move(newParent)
         //@ts-ignore
         expect(one.qualifiedName).to.equal(`${newParent.qualifiedName}.${one.name}`)
         //@ts-ignore
         expect(newParent.instances).to.have.lengthOf(1)
         expect(instance.instances).to.have.lengthOf(5)
      }
   )

   describe('# Fields', function () {
      projectTest(
         `Are created when members are created`,
         async (project, { model, instance }) => { },
         async (project, { model, instance }) => {
            let { values } = project

            let inst = await project.get<IInstance>(QualifiedObjectType.Instance, 'instance.one')
            //@ts-ignore
            expect(inst.fields).to.have.lengthOf(0)
           
            //@ts-ignore
            await inst.model.append({
               string: values.string.value('new')
            })

            //@ts-ignore
            expect(inst.fields).to.have.lengthOf(1)
         }
      )

      

      // it('Fields are merged together correctly when updated', function() {

      // })
   })
})