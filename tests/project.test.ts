import 'mocha'
import { expect } from 'chai'
import { Project } from '../src'
import { validateQualifiedPath } from './utils/validate'
import { QualifiedObjectType } from '../src/core/utils'
import { IInstance, INamespace } from '../src/core'

/*
   TODO Tests:
      project.test.ts
         * getById() should work correctly. If the QualifiedObject is not yet in the Project, it should
           be added. If it is in theProject, it should be updated (maybe pass in an option to update?).
         * Test moving QualifiedObjects outside of the project (ie using a plugin) to simulate
           external state changes. When collections are updated, any objects that still exist in the Project,
           but not in the collection, should be moved to the collection. And any objects that no longer exist 
           in the Project should be deleted.
      value.test.ts
         * Every value can be updated
         * For every type of value, the correct update events are generated
         * Test forUInt andInt positive/negative should throw erros if not correct
         * Array type and sub types have to equal in order for them to be equal
      qualifiedobject.test.ts
         * When a plugin fails to retrieve QualifiedObjects, (map(), filter(), forEach()), an Error should be raised
      namespace/model/instance.test.ts:
         * Test moving them to another namespace, and having it fail when it does the add. It should "recover" and
           put the moving object back into its original collection
      namespace.test.ts
         * Creating a Namespace outside of the Project (ie new Namespace(...)), populating it several deep,
           and addingit to a Namespace that is already a part of the Project, should generate IDs for
           all children, verify that the NAmesapce name is unique, and attach it to the project.
      model.test.ts
         * Reorder members
         * Reordeing members at indexes that don't exist should throw an error
         * Adding members with the same name should fail

*/

describe('Projects', function() {
   it('Project create() creates Namespaces', async function() {
      let project = new Project('test')

      let one = await project.create('one')
      let two = await project.create('one.two')

      expect(one).to.not.be.undefined
      expect(two).to.not.be.undefined

      validateQualifiedPath(one, 'one')
      validateQualifiedPath(two, 'one.two')
   })

   it('Project get() gets Namespaces', async function() {
      let project = new Project('test')

      let two = await project.create('one.two')
      let twoGot = await project.get(QualifiedObjectType.Namespace, 'one.two')

      expect(two).to.equal(twoGot)
   })

   it('Project get() gets Models', async function() {
      let project = new Project('test')

      let two = await project.create('one.two')
      let model = await two.models.create('model')
      let inst = await two.instances.create('model', model)
      let ns = await two.children.create('model')

      let modelGot = await project.get(QualifiedObjectType.Model, 'one.two.model')

      expect(model).to.equal(modelGot)
      expect(model).to.not.equal(inst)
      expect(model).to.not.equal(ns)
   })

   it('Project get() gets Instances', async function() {
      let project = new Project('test')

      let two = await project.create('one.two')
      let model = await two.models.create('model')
      let inst = await two.instances.create('model', model)
      let ns = await two.children.create('model')

      let instGot = await project.get<IInstance>(QualifiedObjectType.Instance, 'one.two.model')

      expect(inst).to.equal(instGot)
      expect(instGot).to.not.equal(model)
      expect(instGot).to.not.equal(ns)
   })

   it('Project delete() deletes Namespaces', async function() {
      let project = new Project('test')

      let two = await project.create('one.two')

      validateQualifiedPath(two, 'one.two')

      await project.delete(QualifiedObjectType.Namespace, 'one.two')

      let found = await project.get<INamespace>(QualifiedObjectType.Namespace, 'one.two')

      expect(found).to.be.undefined
   })

   
   // it('Project delete() deletes Models', async function() {
   //    let project = new Project()

   //    let name = 'NewNamespace'
   //    let subName = 'ChildNewNamespace'
      

   //    let ns = await project.root.children.create(name)
   //    let subNs = await ns.children.create(subName)

   //    let res = project.get(QualifiedObjectType.Namespace, name)
   //    console.dir(res)

   //    expect(ns.name).to.equal(name)
   //    expect(ns.qualifiedName).to.equal(name)
   //    expect(subNs.name).to.equal(subName)
   //    expect(subNs.qualifiedName).to.equal(`${name}.${subName}`)
   // })

   // it('Project delete() deletes Instances', async function() {
   //    let project = new Project()

   //    let name = 'NewNamespace'
   //    let subName = 'ChildNewNamespace'
      

   //    let ns = await project.root.children.create(name)
   //    let subNs = await ns.children.create(subName)

   //    let res = project.get(QualifiedObjectType.Namespace, name)
   //    console.dir(res)

   //    expect(ns.name).to.equal(name)
   //    expect(ns.qualifiedName).to.equal(name)
   //    expect(subNs.name).to.equal(subName)
   //    expect(subNs.qualifiedName).to.equal(`${name}.${subName}`)
   // })

   // it('Cannot delete the Root Namespace', async function() {
   //    let project = new Project()

   //    let name = 'NewNamespace'
   //    let subName = 'ChildNewNamespace'
      

   //    let ns = await project.root.children.create(name)
   //    let subNs = await ns.children.create(subName)

   //    let res = project.get(QualifiedObjectType.Namespace, name)
   //    console.dir(res)

   //    expect(ns.name).to.equal(name)
   //    expect(ns.qualifiedName).to.equal(name)
   //    expect(subNs.name).to.equal(subName)
   //    expect(subNs.qualifiedName).to.equal(`${name}.${subName}`)
   // })

   // it('Cannot move the Root Namespace', async function() {
   //    let project = new Project()

   //    let name = 'NewNamespace'
   //    let subName = 'ChildNewNamespace'
      

   //    let ns = await project.root.children.create(name)
   //    let subNs = await ns.children.create(subName)

   //    let res = project.get(QualifiedObjectType.Namespace, name)
   //    console.dir(res)

   //    expect(ns.name).to.equal(name)
   //    expect(ns.qualifiedName).to.equal(name)
   //    expect(subNs.name).to.equal(subName)
   //    expect(subNs.qualifiedName).to.equal(`${name}.${subName}`)
   // })
})