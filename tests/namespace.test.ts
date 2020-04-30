import 'mocha'
import { expect } from 'chai'

import { QualifiedObjectType } from '../src/core/utils'
import { validateQualifiedPath, doesReject } from './utils/validate'

import { 
   INamespace,
   Project, 
   IModel,
   IInstance} from '../src/core'
import { fill } from './utils/create'

describe('Namespaces', function() {
   it('Should be able to create a Namespace', async function() {
      let project = new Project()

      let name = 'NewNamespace'
      let ns = await project.root.children.create(name)
      expect(ns.name).to.equal(name)
      expect(ns.qualifiedName).to.equal(name)

      let three = await project.create('one.two.three')

      // @ts-ignore
      validateQualifiedPath(three, 'one.two.three')
   })

   it('Qualified name should be correct', async function() {
      let project = new Project()

      let subNs = await project.create('one.two')
      let ns = await project.get(QualifiedObjectType.Namespace, 'one')

      expect(ns).to.not.be.undefined

      // @ts-ignore
      validateQualifiedPath(ns, 'one')
      validateQualifiedPath(subNs, 'one.two')
   })

   it('Can create Namespaces using child Namespaces', async function() {
      let project = new Project()

      let name = 'NewNamespace'
      let subName = 'ChildNewNamespace'
      
      let ns = await project.root.children.create(name)
      let subNs = await ns.children.create(subName)

      validateQualifiedPath(ns, name)
      validateQualifiedPath(subNs, `${name}.${subName}`)
   })

   it('Can rename Namespaces', async function() {
      let project = new Project()

      let name = 'one'
      let subName = 'two'
      let subQName = `${name}.${subName}`

      let subNs = await project.create(subQName)
      let ns = await project.get(QualifiedObjectType.Namespace, name)

      expect(ns).to.not.be.undefined

      let renamed = 'three'
      subQName = `${renamed}.${renamed}` 

      // @ts-ignore
      await ns.rename(renamed)
      await subNs.rename(renamed)

      // @ts-ignore
      validateQualifiedPath(ns, renamed)
      validateQualifiedPath(subNs, subQName)
   })

   it('Can move Namespaces', async function() {
      let project = new Project()
     
      // Moving five --> one
      let three = await project.create('one.two.three')
      let six = await project.create('four.five.six')

      validateQualifiedPath(three, 'one.two.three')
      validateQualifiedPath(six, 'four.five.six')

      let five = await project.get(QualifiedObjectType.Namespace, 'four.five')
      let one = await project.get(QualifiedObjectType.Namespace, 'one')

      expect(five).to.not.be.undefined
      expect(one).to.not.be.undefined

      // @ts-ignore
      validateQualifiedPath(five, 'four.five')

      // @ts-ignore
      await five.move(one as INamespace)

      // @ts-ignore
      validateQualifiedPath(five, 'one.five')
   })

   it('Moving Namespaces moves its children', async function() {
      let project = new Project()
     
      // Moving five --> one
      let three = await project.create('one.two.three')
      let six = await project.create('four.five.six')

      validateQualifiedPath(three, 'one.two.three')
      validateQualifiedPath(six, 'four.five.six')

      let five = await project.get(QualifiedObjectType.Namespace, 'four.five') as INamespace
      let one = await project.get(QualifiedObjectType.Namespace, 'one') as INamespace

      expect(five).to.not.be.undefined
      expect(one).to.not.be.undefined

      // Create children
      let fiveModel = await five.models.create('five-model') as IModel
      await five.instances.create('five-instance', fiveModel) as IInstance

      // @ts-ignore
      validateQualifiedPath(five, 'four.five')

      // @ts-ignore
      await five.move(one as INamespace)

      // @ts-ignore
      validateQualifiedPath(five, 'one.five')

      let foundModel = five.models.get('five-model')
      let foundInst = five.instances.get('five-instance')

      expect(foundModel).to.not.be.undefined
      expect(foundInst).to.not.be.undefined

      // @ts-ignore
      validateQualifiedPath(foundModel, 'one.five.five-model')

      // @ts-ignore
      validateQualifiedPath(foundInst, 'one.five.five-instance')
   })

   it('Deleting Namespace deletes everything under it', async function() {
      let project = await fill({
         models: [
            'one.two.model1',
            'one.two.model2'
         ],
         instances: [
            'one.two.inst1',
            'one.two.inst2'
         ]
      })

      let model1 = await project.get<IModel>(QualifiedObjectType.Model, 'one.two.model1')
      let model2 = await project.get<IModel>(QualifiedObjectType.Model, 'one.two.model2')
      let inst1 = await project.get<IModel>(QualifiedObjectType.Instance, 'one.two.inst1')
      let inst2 = await project.get<IModel>(QualifiedObjectType.Instance, 'one.two.inst2')

      // @ts-ignore
      validateQualifiedPath(model1, 'one.two.model1')

      // @ts-ignore
      validateQualifiedPath(model2, 'one.two.model2')

      // @ts-ignore
      validateQualifiedPath(inst1, 'one.two.inst1')

      // @ts-ignore
      validateQualifiedPath(inst2, 'one.two.inst2')

      let one = await project.get<INamespace>(QualifiedObjectType.Namespace, 'one')

      // @ts-ignore
      await one.children.delete('two')

      model1 = await project.get<IModel>(QualifiedObjectType.Model, 'one.two.model1')
      model2 = await project.get<IModel>(QualifiedObjectType.Model, 'one.two.model2')
      inst1 = await project.get<IModel>(QualifiedObjectType.Instance, 'one.two.inst1')
      inst2 = await project.get<IModel>(QualifiedObjectType.Instance, 'one.two.inst2')
      let three = await project.get<IModel>(QualifiedObjectType.Namespace, 'one.two.three')

      expect(model1).to.be.undefined
      expect(model2).to.be.undefined
      expect(inst1).to.be.undefined
      expect(inst2).to.be.undefined
      expect(three).to.be.undefined
   })

   it(`Should error when there's a name collision during a move`, async function() {
      let project = await fill({
         instances: [
            'one.two.three.one',
            'one.two.one'
         ]
      })

      let model1 = await project.get<IModel>(QualifiedObjectType.Model, 'one.two.three.one')
      let parent2 = await project.get<INamespace>(QualifiedObjectType.Namespace, 'one.two')

      // @ts-ignore
      let didThrow = await doesReject(async () => { await model1.move(parent2) })
      expect(didThrow).to.be.true
   })

   // TODO: Test for all other thrown Errors during a move()
})