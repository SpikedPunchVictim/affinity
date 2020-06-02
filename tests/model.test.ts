import 'mocha'
import { expect } from 'chai'
import { INamespace } from '../src/core'
import { QualifiedObjectType } from '../src/core/utils'
import { projectTest } from './utils/test'
import { IValue } from '../src/core/values/Value'
import { IValueSource } from '../src/core/values/ValueFactory'

describe('Models', function() {
   projectTest(
      `Can be created`,
      async (project, { model }) => { },
      async (project) => {
         let ns = await project.create('parent')
         //@ts-ignore
         await ns.models.create('newmodel')
         //@ts-ignore
         let model = await project.get(QualifiedObjectType.Model, `parent.newmodel`)
         //@ts-ignore
         expect(model).to.not.be.undefined
      }
   )

   projectTest(
      `Can be deleted`,
      async (project, { model }) => { },
      async (project, { model }) => {
         expect(model.models).to.have.lengthOf(6)
         await model.models.delete('one')

         let one = await model.models.get('one')
         expect(model.models).to.have.lengthOf(5)
         //@ts-ignore
         expect(one).to.be.undefined
      })

   projectTest(
      `Can be renamed`,
      async (project, { model }) => { },
      async (project, { model }) => {
         let one = await model.models.get('one')
         //@ts-ignore
         await one.rename('seventeen')
         //@ts-ignore
         expect(one.name).to.equal('seventeen')
      }
   )

   projectTest(
      `Can be moved`,
      async (project, { model }) => { 
         await project.create('new-namespace')
      },
      async (project, { model }) => {
         let one = await model.models.get('one')
         let newParent = await project.get<INamespace>(QualifiedObjectType.Namespace, 'new-namespace')
         //@ts-ignore
         await one.move(newParent)
         //@ts-ignore
         expect(one.qualifiedName).to.equal(`${newParent.qualifiedName}.${one.name}`)
         //@ts-ignore
         expect(newParent.models).to.have.lengthOf(1)
         expect(model.models).to.have.lengthOf(5)
      }
   )

   describe('# Members', function() {
      type CreateValueHandler = (values: IValueSource) => IValue

      type MemberTest = {
         description: string
         name: string
         value: CreateValueHandler
      }

      let tests: MemberTest[] = [
         { description: `bool`, name: 'bool', value: values => values.bool.value(true) },
         { description: `int`, name: 'int', value: values => values.int.value(-3) },
         { description: `string`, name: 'string', value: values => values.string.value('new') },
         { description: `uint`, name: 'uint', value: values => values.uint.value(12) },
         { description: `list`, name: 'list', value: values => values.list.value(values.string.type()) }
      ]

      for(let test of tests) {
         projectTest(
            test.description,
            async (project) => {},
            async (project, { model }) => {
               let { values } = project

               let one = await model.models.get('one')
               
               //@ts-ignore
               await one.members.add({ name: test.name, value: values.string.value(values) })
               //@ts-ignore
               expect(one.members).to.have.lengthOf(1)
            }
         )
      }
   })
})