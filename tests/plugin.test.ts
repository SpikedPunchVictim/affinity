/*
export interface IPlugin {
   readonly name: string
   setup(project: IProject, router: IActionRouter): Promise<void>
}

*/

import { IPlugin, IProject, Project } from '../src/core';
import { expect } from 'chai'

import {
   IActionRouter,
   InstanceCreateAction,
   IRfcAction,
   InstanceDeleteAction,
   InstanceMoveAction,
   InstanceRenameAction,
   FieldCreateAction,
   FieldDeleteAction,
   FieldRenameAction,
   ModelCreateAction,
   ModelDeleteAction,
   ModelMoveAction,
   ModelRenameAction,
   MemberCreateAction,
   MemberRenameAction,
   MemberReorderAction,
   NamespaceCreateAction,
   NamespaceDeleteAction,
   NamespaceRenameAction,
   NamespaceMoveAction,
   ParentChangeAction,
   MemberDeleteAction,
   FieldReorderAction
} from '../src/core/actions';

import { ProjectOpenAction, ProjectCommitAction } from '../src/core/actions/Project';
import { QualifiedObjectType } from '../src/core/utils';

class TestPlugin implements IPlugin {
   readonly name: string = 'test-only-plugin'

   callMap: Map<string, IRfcAction> = new Map<string, IRfcAction>()

   constructor() {

   }

   isSet(type: string) {
      return this.callMap.get(type) || false
   }

   reset(): void {
      this.callMap.clear()
   }

   register<TAction extends IRfcAction>(router: IActionRouter, type: string): void {
      router.on<TAction>(type, async (action) => {
         this.callMap.set(type, action)
      })
   }

   async setup(project: IProject, router: IActionRouter): Promise<void> {
      this.register<ProjectOpenAction>(router, ProjectOpenAction.type)
      this.register<ProjectCommitAction>(router, ProjectCommitAction.type)

      this.register<NamespaceCreateAction>(router, NamespaceCreateAction.type)
      this.register<NamespaceDeleteAction>(router, NamespaceDeleteAction.type)
      this.register<NamespaceRenameAction>(router, NamespaceRenameAction.type)
      this.register<NamespaceMoveAction>(router, NamespaceMoveAction.type)

      this.register<ModelCreateAction>(router, ModelCreateAction.type)
      this.register<ModelDeleteAction>(router, ModelDeleteAction.type)
      this.register<ModelRenameAction>(router, ModelRenameAction.type)
      this.register<ModelMoveAction>(router, ModelMoveAction.type)

      this.register<InstanceCreateAction>(router, InstanceCreateAction.type)
      this.register<InstanceDeleteAction>(router, InstanceDeleteAction.type)
      this.register<InstanceRenameAction>(router, InstanceRenameAction.type)
      this.register<InstanceMoveAction>(router, InstanceMoveAction.type)

      this.register<FieldCreateAction>(router, FieldCreateAction.type)
      this.register<FieldDeleteAction>(router, FieldDeleteAction.type)
      this.register<FieldRenameAction>(router, FieldRenameAction.type)
      this.register<FieldReorderAction>(router, FieldReorderAction.type)

      this.register<MemberCreateAction>(router, MemberCreateAction.type)
      this.register<MemberDeleteAction>(router, MemberDeleteAction.type)
      this.register<MemberRenameAction>(router, MemberRenameAction.type)
      this.register<MemberReorderAction>(router, MemberReorderAction.type)

      this.register<ParentChangeAction>(router, ParentChangeAction.type)
   }
}

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
         action(ProjectCommitAction.type, async () => await project.open()),
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
            await project.create('one')
            await project.create('two')
            await project.create('three')
            plugin.reset()
            await project.root.children.move(0, 2)
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
         action(FieldCreateAction.type, async () => {
            // let one = await project.create('one')
            // let model = await one.models.create('model')
            // let inst = await one.instances.create('inst', model)
            // plugin.reset()
            // await model.members.create()
         }),
         action(FieldDeleteAction.type, async () => {

         }),
         action(FieldRenameAction.type, async () => {

         }),
         action(FieldReorderAction.type, async () => {

         }),
         action(MemberCreateAction.type, async () => {

         }),
         action(MemberDeleteAction.type, async () => {

         }),
         action(MemberRenameAction.type, async () => {

         }),
         action(MemberReorderAction.type, async () => {

         }),
         action(ParentChangeAction.type, async () => {

         })
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