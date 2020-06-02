/*
export interface IPlugin {
   readonly name: string
   setup(project: IProject, router: IActionRouter): Promise<void>
}

*/

import { Project } from '../src/core/Project';
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
import { QualifiedObjectType, Switch } from '../src/core/utils/Types';
import { TestPlugin } from './utils/plugin';
import { backendTest } from './utils/test';
import { IInstance } from '../src/core/Instance';

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
            await one.models.delete('model')
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

      //-- Add
      async function addData(type: QualifiedObjectType): Promise<void> {
         let updates = [
            async (project, { namespace, model, instance }) => {
               return await Switch.onType(type, {
                  Namespace: async () => {
                     await namespace.children.get('ten')
                  },
                  Model: async () => {
                     await model.models.get('ten')
                  },
                  Instance: async () => {
                     await instance.instances.get('ten')
                  }
               })
            },
            async (project, { namespace, model, instance }) => {
               return await Switch.onType(type, {
                  Namespace: async () => {
                     await namespace.update()
                  },
                  Model: async () => {
                     await model.update()
                  },
                  Instance: async () => {
                     await instance.update()
                  }
               })
            }
         ]

         for(let update of updates) {
            backendTest(
               `${type} Add: collection.get()`,
               async (source, { namespace, model, instance }) => {
                  await Switch.onType(type, {
                     Namespace: async () => {
                        await namespace.children.create('ten')
                     },
                     Model: async () => {
                        await model.models.create('ten')
                     },
                     Instance: async () => {
                        let modelOne = await model.models.get('one')
                        //@ts-ignore
                        await instance.instances.create('ten', modelOne)
                     }
                  })
               },
               async (project, parents) => {
                  return await update(project, parents)
               },
               async (project, { namespace, model, instance }) => {
                  let collection = Switch.onType(type, {
                     //@ts-ignore
                     Namespace: () => namespace.children,
                     //@ts-ignore
                     Model: () => model.models,
                     //@ts-ignore
                     Instance: () => instance.instances
                  })
   
                  expect(collection).to.have.lengthOf(7)
                  let ten = await collection.get('ten')
                  //@ts-ignore
                  expect(ten).to.not.be.undefined
               })
         }
      }

      //-- Move
      async function moveData(type: QualifiedObjectType): Promise<void> {
         let updates = [
            async (project, { namespace, model, instance }) => {
               await Switch.onType(type, {
                  //@ts-ignore
                  Namespace: async () => await namespace.children.get('one'),
                  //@ts-ignore
                  Model: async () => await model.models.get('one'),
                  //@ts-ignore
                  Instance: async () => await instance.instances.get('one')
               })
            },
            async (project, { namespace, model, instance }) => {
               await Switch.onType(type, {
                  //@ts-ignore
                  Namespace: async () => await namespace.update(),
                  //@ts-ignore
                  Model: async () => await model.update(),
                  //@ts-ignore
                  Instance: async () => await instance.update()
               })
            }
         ]

         for(let update of updates) {
            backendTest(
               `${type} Move: children.get()`,
               /*
                  starting:[ one, two, three, four, five, six ]
                  ends with:[ two, three, six, five, one, four ]
               */
               async (source, { namespace, model, instance }) => {
                  let collection = Switch.onType(type, {
                     //@ts-ignore
                     Namespace: () => namespace.children,
                     //@ts-ignore
                     Model: () => model.models,
                     //@ts-ignore
                     Instance: () => instance.instances
                  })
   
                  await collection.move(1, 0)
                  // two, one, three, four, five six
                  await collection.move(2, 1)
                  // two, three, one, four, five, six
                  await collection.move(5, 2)
                  // two, three, six, one, four, five
                  await collection.move(5, 3)
                  // two, three, six, five, one, four
               },
               async (project, parents) => {
                  await update(project, parents)
               },
               async (project, { namespace, model, instance }) => {
                  let collection = Switch.onType(type, {
                     //@ts-ignore
                     Namespace: () => namespace.children,
                     //@ts-ignore
                     Model: () => model.models,
                     //@ts-ignore
                     Instance: () => instance.instances
                  })
   
                  expect(collection).to.have.lengthOf(6)
                  expect(collection.observable.at(0).name).to.equal('two')
                  expect(collection.observable.at(1).name).to.equal('three')
                  expect(collection.observable.at(2).name).to.equal('six')
                  expect(collection.observable.at(3).name).to.equal('five')
                  expect(collection.observable.at(4).name).to.equal('one')
                  expect(collection.observable.at(5).name).to.equal('four')
               })
         }
      }

      //-- Delete
      async function deleteData(type:QualifiedObjectType): Promise<void> {
         let updates = [
            async (project, { namespace, model, instance }) => {
               await Switch.onType(type, {
                  //@ts-ignore
                  Namespace: async () => namespace.children.get('one'),
                  //@ts-ignore
                  Model: async () => model.models.get('one'),
                  //@ts-ignore
                  Instance: async () => instance.instances.get('one')
               })
            },
            async (project, { namespace, model, instance }) => {
               await Switch.onType(type, {
                  //@ts-ignore
                  Namespace: async () => namespace.update(),
                  //@ts-ignore
                  Model: async () => model.update(),
                  //@ts-ignore
                  Instance: async () => instance.update()
               })
            }
         ]

         for (let update of updates) {
            backendTest(
               `${type} Delete: collection.get()`,
               async (source, { namespace, model, instance }) => {
                  let collection = Switch.onType(type, {
                     //@ts-ignore
                     Namespace: () => namespace.children,
                     //@ts-ignore
                     Model: () => model.models,
                     //@ts-ignore
                     Instance: () => instance.instances
                  })
   
                  await collection.delete('three')
               },
               async (project, parents) => {
                  await update(project, parents)
               },
               async (project, { namespace, model, instance }) => {
                  let collection = Switch.onType(type, {
                     //@ts-ignore
                     Namespace: () => namespace.children,
                     //@ts-ignore
                     Model: () => model.models,
                     //@ts-ignore
                     Instance: () => instance.instances
                  })
   
                  expect(collection).to.have.lengthOf(5)
                  expect(collection.observable.at(0).name).to.equal('one')
                  expect(collection.observable.at(1).name).to.equal('two')
                  expect(collection.observable.at(2).name).to.equal('four')
                  expect(collection.observable.at(3).name).to.equal('five')
                  expect(collection.observable.at(4).name).to.equal('six')
               })
         }
      }

      //-- Move and Delete Parent
      async function moveAndDeleteParent(type: QualifiedObjectType): Promise<void> {
         let updates = [
            async (project, { namespace, model, instance }) => {
               await Switch.onType(type, {
                  //@ts-ignore
                  Namespace: async () => namespace.children.get('one'),
                  //@ts-ignore
                  Model: async () => model.models.get('one'),
                  //@ts-ignore
                  Instance: async () => instance.instances.get('one')
               })
            },
            async (project, { namespace, model, instance }) => {
               await Switch.onType(type, {
                  //@ts-ignore
                  Namespace: async () => namespace.update(),
                  //@ts-ignore
                  Model: async () => model.update(),
                  //@ts-ignore
                  Instance: async () => instance.update()
               })
            }
         ]

         for(let update of updates) {
            backendTest(
               `${type} Move from another collection and Delete Parent: collection.get()`,
               async (source, { namespace, model, instance }) => {
                  let newParent = await source.create('testtparent')
   
                  await Switch.onType(type, {
                     Namespace: async () => {
                        let ns = await newParent.children.create('new')
                        await ns.move(namespace)
                     },
                     Model: async () => {
                        let mdl = await newParent.models.create('new')
                        await mdl.move(model)
                     },
                     Instance: async () => {
                        let modelOne = await model.models.get('one')
                        //@ts-ignore
                        let inst = await newParent.instances.create('new', modelOne)
                        await inst.move(instance)
                     }
                  })
   
                  //@ts-ignore
                  await newParent.parent.children.delete(newParent.name)
               },
               async (project, parents) => {
                  await update(project, parents)
               },
               async (project, { namespace, model, instance }) => {
                  Switch.onType(type, {
                     //@ts-ignore
                     Namespace: () => {
                        expect(namespace.children).to.have.lengthOf(6)
                        //@ts-ignore
                        let found = namespace.children.observable.find(it => it.name === 'new')
                        //@ts-ignore
                        expect(found.parent.id).to.equal(namespace.id)
                     },
                     //@ts-ignore
                     Model: () => {
                        expect(model.models).to.have.lengthOf(6)
                        let found = model.models.observable.find(it => it.name === 'new')
                        //@ts-ignore
                        expect(found.parent.id).to.equal(model.id)
                     },
                     //@ts-ignore
                     Instance: () => {
                        expect(instance.instances).to.have.lengthOf(6)
                        let found = instance.instances.observable.find(it => it.name === 'new')
                        //@ts-ignore
                        expect(found.parent.id).to.equal(instance.id)
                     }
                  })
               })
         }
      }

      //-- Reorder & Rename
      async function reorderAndRename(type: QualifiedObjectType): Promise<void> {
         let updates = [
            async (project, { namespace, model, instance }) => {
               await Switch.onType(type, {
                  //@ts-ignore
                  Namespace: async () => namespace.children.get('one'),
                  //@ts-ignore
                  Model: async () => model.models.get('one'),
                  //@ts-ignore
                  Instance: async () => instance.instances.get('one')
               })
            },

         ]

         for(let update of updates) {
            backendTest(
               `${type} Reorder in Collection and Rename: collection.get()`,
               /*
                  starting:[ one, two, three, four, five, six ]
                  ends with:[ two, three, six, five, one, four ]
               */
               async (source, { namespace, model, instance }) => {
                  let collection = Switch.onType(type, {
                     //@ts-ignore
                     Namespace: () => namespace.children,
                     //@ts-ignore
                     Model: () => model.models,
                     //@ts-ignore
                     Instance: () => instance.instances
                  })
   
                  await collection.move(1, 0)
                  // two, one, three, four, five six
                  await collection.move(2, 1)
                  // two, three, one, four, five, six
                  await collection.move(5, 2)
                  // two, three, six, one, four, five
                  await collection.move(5, 3)
                  // two, three, six, five, one, four
   
                  // Rename them
                  await (await collection.at(0)).rename('six')
                  await (await collection.at(1)).rename('five')
                  await (await collection.at(2)).rename('four')
                  await (await collection.at(3)).rename('three')
                  await (await collection.at(4)).rename('two')
                  await (await collection.at(5)).rename('one')
               },
               async (project, parents) => {
                  await update(project, parents)
               },
               async (project, { namespace, model, instance }) => {
                  let collection = Switch.onType(type, {
                     //@ts-ignore
                     Namespace: () => namespace.children,
                     //@ts-ignore
                     Model: () => model.models,
                     //@ts-ignore
                     Instance: () => instance.instances
                  })
   
                  expect(collection).to.have.lengthOf(6)
                  expect(collection.observable.at(0).name).to.equal('six')
                  expect(collection.observable.at(1).name).to.equal('five')
                  expect(collection.observable.at(2).name).to.equal('four')
                  expect(collection.observable.at(3).name).to.equal('three')
                  expect(collection.observable.at(4).name).to.equal('two')
                  expect(collection.observable.at(5).name).to.equal('one')
               })
         }
      }

      async function testType(type: QualifiedObjectType): Promise<void> {
         await addData(type)
         await moveData(type)
         await deleteData(type)
         await moveAndDeleteParent(type)
         await reorderAndRename(type)
      }

      testType(QualifiedObjectType.Namespace)
      testType(QualifiedObjectType.Model)
      testType(QualifiedObjectType.Instance)

      backendTest(
         `Creating members updates fields`,
         async (source, { instance }) => {
            let inst = await source.get<IInstance>(QualifiedObjectType.Instance, 'instance.one')
            let { values } = source

            //@ts-ignore
            inst.model.members.append({
               string: values.string.value('new'),
               int: values.int.value(2)
            })
         },
         async (project) => { },
         async (project) => {
            let inst = await project.get<IInstance>(QualifiedObjectType.Instance, 'instance.one')

            //@ts-ignore
            expect(inst.fields).to.have.lengthOf(2)
            //@ts-ignore
            expect(inst.fields.observable.at(0).name).equals('string')
            //@ts-ignore
            expect(inst.fields.observable.at(1).name).equals('int')
         }
      )
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