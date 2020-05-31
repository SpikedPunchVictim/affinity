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
import { QualifiedObjectType, Switch } from '../src/core/utils/Types';
import { TestPlugin, DataPlugin, DebugPlugin } from './utils/plugin';
import { create } from './utils/create';

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

      type ParentNamespaces = {
         namespace: INamespace
         model: INamespace
         instance: INamespace
      }

      type OnUpdateProjectHandler = (project: IProject, parents: ParentNamespaces) => Promise<void>

      function test(
         description: string,
         updateSource: OnUpdateProjectHandler,
         updateProject: OnUpdateProjectHandler,
         testProject: OnUpdateProjectHandler): void {
         it(description, async function () {
            let cfg = {
               namespaces: [
                  { path: 'namespace', id: 'namespace' },
                  { path: 'model', id: 'model' },
                  { path: 'instance', id: 'instance' },
                  { path: 'namespace.one', id: 'n1' },
                  { path: 'namespace.two', id: 'n2' },
                  { path: 'namespace.three', id: 'n3' },
                  { path: 'namespace.four', id: 'n4' },
                  { path: 'namespace.five', id: 'n5' },
                  { path: 'namespace.six', id: 'n6' }
               ],
               models: [
                  { path: 'model.one', id: 'm1' },
                  { path: 'model.two', id: 'm2' },
                  { path: 'model.three', id: 'm3' },
                  { path: 'model.four', id: 'm4' },
                  { path: 'model.five', id: 'm5' },
                  { path: 'model.six', id: 'm6' }
               ],
               instances: [
                  { path: 'instance.one', id: 'i1' },
                  { path: 'instance.two', id: 'i2' },
                  { path: 'instance.three', id: 'i3' },
                  { path: 'instance.four', id: 'i4' },
                  { path: 'instance.five', id: 'i5' },
                  { path: 'instance.six', id: 'i6' }
               ]
            }

            let { project, source } = await setup(cfg)

            let sourceNamespace = await source.get<INamespace>(QualifiedObjectType.Namespace, 'namespace')
            let sourceModel = await source.get<INamespace>(QualifiedObjectType.Namespace, 'model')
            let sourceInstance = await source.get<INamespace>(QualifiedObjectType.Namespace, 'instance')

            let projectNamespace = await project.get<INamespace>(QualifiedObjectType.Namespace, 'namespace')
            let projectModel = await project.get<INamespace>(QualifiedObjectType.Namespace, 'model')
            let projectInstance = await project.get<INamespace>(QualifiedObjectType.Namespace, 'instance')

            let sourceParents: ParentNamespaces = {
               //@ts-ignore
               namespace: sourceNamespace,
               //@ts-ignore
               model: sourceModel,
               //@ts-ignore
               instance: sourceInstance
            }

            //@ts-ignore
            let projectParents: ParentNamespaces = {
               //@ts-ignore
               namespace: projectNamespace,
               //@ts-ignore
               model: projectModel,
               //@ts-ignore
               instance: projectInstance
            }

            await updateSource(source, sourceParents)
            await updateProject(project, projectParents)
            await testProject(project, projectParents)
         })
      }

      function testType(type: QualifiedObjectType): void {
         test(
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

         test(
            `${type} Add: object.update()`,
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

         test(
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

         test(
            `${type} Move: object.update()`,
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
            async (project, { namespace, model, instance }) => {
               await Switch.onType(type, {
                  //@ts-ignore
                  Namespace: async () => await namespace.update('one'),
                  //@ts-ignore
                  Model: async () => await model.update('one'),
                  //@ts-ignore
                  Instance: async () => await instance.update('one')
               })
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

         test(
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

         test(
            `${type} Delete: object.update()`,
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
            async (project, { namespace, model, instance }) => {
               await Switch.onType(type, {
                  //@ts-ignore
                  Namespace: async () => namespace.update(),
                  //@ts-ignore
                  Model: async () => model.update(),
                  //@ts-ignore
                  Instance: async () => instance.update()
               })
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

         test(
            `${type} Move from another collection and Delete Parent: collection.get()`,
            async (source, { namespace, model, instance }) => {
               let newParent = await source.create('testparent')

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

         test(
            `${type} Move from another collection and Delete Parent: object.update()`,
            async (source, { namespace, model, instance }) => {
               let newParent = await source.create('testparent')

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
            async (project, { namespace, model, instance }) => {
               await Switch.onType(type, {
                  //@ts-ignore
                  Namespace: async () => namespace.update(),
                  //@ts-ignore
                  Model: async () => model.update(),
                  //@ts-ignore
                  Instance: async () => instance.update()
               })
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

         test(
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

         test(
            `${type} Reorder in Collection and Rename: object.update()`,
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
            async (project, { namespace, model, instance }) => {
               await Switch.onType(type, {
                  //@ts-ignore
                  Namespace: async () => namespace.update(),
                  //@ts-ignore
                  Model: async () => model.update(),
                  //@ts-ignore
                  Instance: async () => instance.update()
               })
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

      testType(QualifiedObjectType.Namespace)
      testType(QualifiedObjectType.Model)
      testType(QualifiedObjectType.Instance)
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