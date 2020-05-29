/*
export interface IPlugin {
   readonly name: string
   setup(project: IProject, router: IActionRouter): Promise<void>
}

*/

import { Project, IProject } from '../src/core/Project';
import { INamespace } from '../src/core/Namespace'
import { expect } from 'chai'

import {
   InstanceCreateAction,
   InstanceDeleteAction,
   InstanceMoveAction,
   InstanceRenameAction,
   ModelCreateAction,
   ModelDeleteAction,
   ModelMoveAction,
   ModelRenameAction,
   NamespaceCreateAction,
   NamespaceDeleteAction,
   NamespaceRenameAction,
   NamespaceMoveAction,
   NamespaceReorderAction,
   ModelReorderAction,
   InstanceReorderAction,
   FieldGetAction,
} from '../src/core/actions';

import { ProjectOpenAction, ProjectCommitAction } from '../src/core/actions/Project';
import { QualifiedObjectType, Switch } from '../src/core/utils';
import { TestPlugin, DataPlugin, DebugPlugin } from './utils/plugin';
import { create, populate } from './utils/create';
import { IQualifiedObject } from '../src/core';
import { IQualifiedObjectCollection } from '../src/core/collections/QualifiedObjectCollection';

function action(type: string, fn: () => Promise<void>) {
   return {
      type,
      fn
   }
}

describe('Plugins', function () {
   describe('# Actions', function () {
      let plugin = new TestPlugin()
      let project = new Project('test')
      project.use(plugin)

      let tests = [
         action(ProjectOpenAction.type, async () => await project.open()),
         action(ProjectCommitAction.type, async () => await project.commit()),
         action(NamespaceCreateAction.type, async () => { await project.create('one') }),
         action(NamespaceDeleteAction.type, async () => {
            await project.create('one')
            plugin.reset()
            await project.delete(QualifiedObjectType.Namespace, 'one')
         }),
         action(NamespaceRenameAction.type, async () => {
            let one = await project.create('one')
            plugin.reset()
            await one.rename('two')
         }),
         action(NamespaceMoveAction.type, async () => {
            let one = await project.create('one')
            let three = await project.create('two.three')
            plugin.reset()
            await three.move(one)
         }),
         action(NamespaceReorderAction.type, async () => {
            let one = await project.create('one')
            await project.create('one.three')
            await project.create('one.four')
            await project.create('one.five')
            plugin.reset()
            await one.children.move(0, 2)
         }),
         action(ModelCreateAction.type, async () => {
            let one = await project.create('one')
            plugin.reset()
            await one.models.create('model')
         }),
         action(ModelDeleteAction.type, async () => {
            let one = await project.create('one')
            await one.models.create('model')
            plugin.reset()
            one.models.delete('model')
         }),
         action(ModelRenameAction.type, async () => {
            let one = await project.create('one')
            let model = await one.models.create('model')
            plugin.reset()
            await model.rename('six')
         }),
         action(ModelMoveAction.type, async () => {
            let one = await project.create('one')
            let two = await project.create('two')
            let model = await one.models.create('model')
            plugin.reset()
            await model.move(two)
         }),
         action(ModelReorderAction.type, async () => {
            let one = await project.create('one')
            await one.models.create('three')
            await one.models.create('four')
            await one.models.create('five')
            plugin.reset()
            await one.models.move(0, 2)
         }),
         action(InstanceCreateAction.type, async () => {
            let one = await project.create('one')
            let model = await one.models.create('model')
            plugin.reset()
            await one.instances.create('inst', model)
         }),
         action(InstanceDeleteAction.type, async () => {
            let one = await project.create('one')
            let model = await one.models.create('model')
            let inst = await one.instances.create('inst', model)
            plugin.reset()
            await project.delete(QualifiedObjectType.Instance, inst.qualifiedName)
         }),
         action(InstanceRenameAction.type, async () => {
            let one = await project.create('one')
            let model = await one.models.create('model')
            let inst = await one.instances.create('inst', model)
            plugin.reset()
            await inst.rename('somethingelse')
         }),
         action(InstanceMoveAction.type, async () => {
            let one = await project.create('one')
            let two = await project.create('one.two')
            let model = await one.models.create('model')
            let inst = await one.instances.create('inst', model)
            plugin.reset()
            await inst.move(two)
         }),
         action(InstanceReorderAction.type, async () => {
            let one = await project.create('one')
            let model = await one.models.create('model')
            await one.instances.create('three', model)
            await one.instances.create('four', model)
            await one.instances.create('five', model)
            plugin.reset()
            await one.instances.move(0, 2)
         }),
         action(FieldGetAction.type, async () => {
            let one = await project.create('one')
            let model = await one.models.create('model')
            let inst = await one.instances.create('inst', model)
            await model.members.append({
               name: 'new-name'
            })
            plugin.reset()
            await inst.get('name')
         }),
         // action(FieldResetAction.type, async () => {
         //    let one = await project.create('one')
         //    let model = await one.models.create('model')
         //    let inst = await one.instances.create('inst', model)
         //    await model.members.append({
         //       name: 'new-name'
         //    })
         //    let field = await inst.get('name')
         //    field.value.set()
         //    plugin.reset()

         // }),
         // action(FieldValueChangeAction.type, async () => {

         // }),
         // action(MemberCreateAction.type, async () => {

         // }),
         // action(MemberDeleteAction.type, async () => {

         // }),
         // action(MemberRenameAction.type, async () => {

         // }),
         // action(MemberReorderAction.type, async () => {

         // })
      ]

      this.beforeEach(function () {
         plugin = new TestPlugin()
         project = new Project('plugin-test')
         project.use(plugin)
      })

      for (let test of tests) {
         it(test.type, async function () {
            await test.fn()
            expect(plugin.isSet(test.type), `The Action was not raised`).to.be.true
            expect(plugin.callMap.size, `More than 1 Action was raised`).to.equal(1)
         })
      }
   })

   describe('# Data', async function () {
      /*
         Setup creates 2 projects: project, plugin
         Changes made to the plugin Project will be reflected when the
         project Project is queried
      */

      type TestSetup = {
         project: IProject,
         source: IProject
      }

      async function setup(config: any, debug: boolean = false): Promise<TestSetup> {
         let project = await create(config, 'project')
         let source = await create(config, 'source')

         let dataPlugin = new DataPlugin(source)

         if (debug) {
            let debugProjectPlugin = new DebugPlugin(project)
            let debugSourcePlugin = new DebugPlugin(source)
            project.use(debugProjectPlugin)
            source.use(debugSourcePlugin)
         }

         project.use(dataPlugin)

         return { project, source }
      }

      /*
         * Get new Namespaces, Models, Instances
         * Delete Namespace, Model, Inst and have it properly update the colelction
         * Move Namespace, Model, Inst 
            * (move ns, and delete its parent, then update it)
            * Reorder Namespace/Model/Inst then update
            * Reorder subject's siblings and rname them
         * Update Namespace, Model, Instances
            * Test changes to Member, Fields, Names, Parents, etc
            * Separately test the QualifiedObject update() methods 
         
         
         let { project, plugin } = setup({
            namespaces: [

            ],
            models: [

            ],
            instances: [

            ]
         })
         
      */

      function testNewAdd<TQualifiedObject extends IQualifiedObject>(description: string, type: QualifiedObjectType): void {
         it(description, async function () {
            let config = Switch.onType<any>(type, {
               Namespace: () => {
                  return {
                     namespaces: [
                        { path: 'one', id: '1' },
                        { path: 'one.two', id: '2' }
                     ]
                  }
               },
               Model: () => {
                  return {
                     models: [
                        { path: 'one', id: '1' },
                        { path: 'one.two', id: '2' }
                     ]
                  }
               },
               Instance: () => {
                  return {
                     instances: [
                        { path: 'one', id: '1' },
                        { path: 'one.two', id: '2' }
                     ]
                  }
               }
            })

            let { project, source } = await setup(config)

            let one = await project.get<INamespace>(QualifiedObjectType.Namespace, 'one')

            // Need to do this to avoid placing ts-ignore on every line
            if (one === undefined) {
               expect(one).to.not.be.undefined
               return
            }

            let collection: IQualifiedObjectCollection<TQualifiedObject>

            collection = await Switch.onType<IQualifiedObjectCollection<TQualifiedObject>>(type, {
               //@ts-ignore
               Namespace: async () => {
                  await populate(source, {
                     namespaces: [
                        { path: 'one.three' },
                        { path: 'one.four' }
                     ]
                  })

                  //@ts-ignore
                  return one.children
               },
               //@ts-ignore
               Model: async () => {
                  await populate(source, {
                     models: [
                        { path: 'one.three' },
                        { path: 'one.four' }
                     ]
                  })

                  //@ts-ignore
                  return one.models
               },
               //@ts-ignore
               Instance: async () => {
                  await populate(source, {
                     instances: [
                        { path: 'one.three' },
                        { path: 'one.four' }
                     ]
                  })

                  //@ts-ignore
                  return one.instances
               }
            })

            //@ts-ignore
            let three = await collection.get('three')
            //@ts-ignore
            let four = await collection.get('four')

            expect(three).to.not.be.undefined
            expect(four).to.not.be.undefined
            //@ts-ignore
            expect(three.qualifiedName).to.equal("one.three")
            //@ts-ignore
            expect(four.qualifiedName).to.equal("one.four")
         })
      }

      testNewAdd<INamespace>('Added Namespace updates correctly', QualifiedObjectType.Namespace)
      testNewAdd<INamespace>('Added Model updates correctly', QualifiedObjectType.Model)
      testNewAdd<INamespace>('Added Instance updates correctly', QualifiedObjectType.Instance)

      // it('Retrieve new Namespace', async function () {
      //    let { project, source } = await setup({
      //       namespaces: [
      //          { path: 'one', id: '1' },
      //          { path: 'one.two', id: '2' }
      //       ]
      //    })

      //    await source.create('one.three')
      //    await source.create('one.four')

      //    let one = await project.get<INamespace>(QualifiedObjectType.Namespace, 'one')

      //    expect(one).to.not.be.undefined

      //    //@ts-ignore
      //    let three = await one.children.get('three')
      //    //@ts-ignore
      //    let four = await one.children.get('four')

      //    expect(three).to.not.be.undefined
      //    expect(four).to.not.be.undefined
      //    //@ts-ignore
      //    expect(three.name).to.equal("three")
      //    //@ts-ignore
      //    expect(three.qualifiedName).to.equal("one.three")
      //    //@ts-ignore
      //    expect(four.qualifiedName).to.equal("one.four")
      // })

      // it('Retrieve new Model', async function () {
      //    let { project, source } = await setup({
      //       namespaces: [
      //          { path: 'one', id: '1' },
      //       ],
      //       models: [
      //          { path: 'one.model1', id: '2' }
      //       ]
      //    })

      //    let sourceOne = await source.get<INamespace>(QualifiedObjectType.Namespace, 'one')
      //    //@ts-ignore
      //    await sourceOne.models.create('model2')
      //    //@ts-ignore
      //    await sourceOne.models.create('model3')

      //    let one = await project.get<INamespace>(QualifiedObjectType.Namespace, 'one')

      //    expect(one).to.not.be.undefined

      //    //@ts-ignore
      //    let three = await one.models.get('model2')
      //    //@ts-ignore
      //    let four = await one.models.get('model3')

      //    expect(three).to.not.be.undefined
      //    expect(four).to.not.be.undefined
      //    //@ts-ignore
      //    expect(three.name).to.equal("model2")
      //    //@ts-ignore
      //    expect(three.qualifiedName).to.equal("one.model2")
      //    //@ts-ignore
      //    expect(four.qualifiedName).to.equal("one.model3")
      // })

      // it('Retrieve new Instance', async function () {
      //    let { project, source } = await setup({
      //       namespaces: [
      //          { path: 'one', id: '1' },
      //       ],
      //       models: [
      //          { path: 'one.model1', id: '2' }
      //       ],
      //       instances: [
      //          { path: 'one.inst1', id: '3' }
      //       ]
      //    })

      //    let sourceOne = await source.get<INamespace>(QualifiedObjectType.Namespace, 'one')
      //    let sourceModel = await source.get<IModel>(QualifiedObjectType.Model, 'one.model1')
      //    //@ts-ignore
      //    await sourceOne.instances.create('inst2', sourceModel)
      //    //@ts-ignore
      //    await sourceOne.instances.create('inst3', sourceModel)

      //    let one = await project.get<INamespace>(QualifiedObjectType.Namespace, 'one')

      //    if (one === undefined) {
      //       expect(one).to.not.be.undefined
      //    }

      //    //@ts-ignore
      //    let two = await one.instances.get('inst2')
      //    //@ts-ignore
      //    let three = await one.instances.get('inst3')

      //    expect(two).to.not.be.undefined
      //    expect(three).to.not.be.undefined
      //    //@ts-ignore
      //    expect(two.name).to.equal("inst2")
      //    //@ts-ignore
      //    expect(two.qualifiedName).to.equal("one.inst2")
      //    //@ts-ignore
      //    expect(three.qualifiedName).to.equal("one.inst3")
      // })

      it('Namespace Should update correctly when moved', async function () {
         let { project, source } = await setup({
            namespaces: [
               { path: 'one', id: '1' },
               { path: 'one.two', id: '2' },
               { path: 'one.three', id: '3' },
               { path: 'one.four', id: '4' },
               { path: 'one.five', id: '5' },
               { path: 'one.six', id: '6' },
            ]
         })

         let one = await project.get<INamespace>(QualifiedObjectType.Namespace, 'one')

         if (one === undefined) {
            expect(one).to.not.be.undefined
            return
         }

         expect(one.children).to.have.lengthOf(5)
         expect(one.children.observable.at(0).name).to.equal('two')
         expect(one.children.observable.at(1).name).to.equal('three')
         expect(one.children.observable.at(2).name).to.equal('four')
         expect(one.children.observable.at(3).name).to.equal('five')
         expect(one.children.observable.at(4).name).to.equal('six')

         /*
             starting:[ two, three, four, five, six ]
            ends with:[ four, two, five, six, three ]
         */
         let sourceOne = await source.get<INamespace>(QualifiedObjectType.Namespace, 'one')

         if (sourceOne === undefined) {
            expect(sourceOne).to.not.be.undefined
            return
         }

         await sourceOne.children.move(2, 0)
         await sourceOne.children.move(1, 4)

         await one.update()

         expect(one.children).to.have.lengthOf(5)
         expect(one.children.observable.at(0).name).to.equal('two')
         expect(one.children.observable.at(1).name).to.equal('three')
         expect(one.children.observable.at(2).name).to.equal('four')
         expect(one.children.observable.at(3).name).to.equal('five')
         expect(one.children.observable.at(4).name).to.equal('six')
      })

      it('Namespace Should update correctly when some of its children have been deleted', async function () {
         let { project, source } = await setup({
            namespaces: [
               { path: 'one', id: '1' },
               { path: 'one.two', id: '2' },
               { path: 'one.three', id: '3' },
               { path: 'one.four', id: '4' },
               { path: 'one.five', id: '5' },
               { path: 'one.six', id: '6' },
            ]
         })

         let one = await project.get<INamespace>(QualifiedObjectType.Namespace, 'one')

         // This is done to avoid adding @ts-ignore to every line
         if (one === undefined) {
            expect(one).to.not.be.undefined
            return
         }

         expect(one.children).to.have.lengthOf(5)
         expect(one.children.observable.at(0).name).to.equal('two')
         expect(one.children.observable.at(1).name).to.equal('three')
         expect(one.children.observable.at(2).name).to.equal('four')
         expect(one.children.observable.at(3).name).to.equal('five')
         expect(one.children.observable.at(4).name).to.equal('six')

         /*
             starting:[ two, three, four, five, six ]
            ends with:[ two, four, five, six ]
         */
         let sourceOne = await source.get<INamespace>(QualifiedObjectType.Namespace, 'one')

         if (sourceOne === undefined) {
            expect(sourceOne).to.not.be.undefined
            return
         }

         await sourceOne.children.delete('three')

         await one.update()

         expect(one.children).to.have.lengthOf(5)
         expect(one.children.observable.at(0).name).to.equal('two')
         expect(one.children.observable.at(1).name).to.equal('four')
         expect(one.children.observable.at(2).name).to.equal('five')
         expect(one.children.observable.at(3).name).to.equal('six')
      })


   })



   /*
   // TODO:
   it('Namespace delete returns action in depth first order', function() {
      let project = fill({
         namespaces: [
            'one.two.three.four.ns1',
            'one.two.three.ns2',
            'one.two.three.ns3',
         ],
         models: [
            'one.two.three.model1',
            'one.two.three.model2',
            'one.two.three.model3',
            'one.two.three.model4',
            'one.two.three.four.model5',
            'one.two.three.four.model6',
            'one.two.three.four.ns1.model7',
         ],
         instances: [
            'one.two.three.four.inst1',
            'one.two.three.int2'
         ]
      })
   })
   */

})