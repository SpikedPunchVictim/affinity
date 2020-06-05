import 'mocha'
import { IProject } from "../../src/core/Project"
import { INamespace } from "../../src/core/Namespace"
import { QualifiedObjectType } from "../../src/core/utils/Types"
import { full } from './setup'
import { create } from './create'

type ParentNamespaces = {
   namespace: INamespace
   model: INamespace
   instance: INamespace
}

export type OnUpdateProjectHandler = (project: IProject, parents: ParentNamespaces) => Promise<void>

/**
 * Builds out a project with 3 top-level pre-populated Namespaces:
 *    * namespace: Contains 6 Namespaces named 'one' through 'six'
 *    * models: Contains 6 Models named 'one' through 'six'
 *    * instances: Contains 6 Instances named 'one' through 'six'
 * 
 * @param description The test description
 * @param updateSource Function to update the source data
 * @param updateProject Function to update the project data
 * @param testProject Function to test the changes
 */
export async function backendTest(
   description: string,
   updateSource: OnUpdateProjectHandler,
   updateProject: OnUpdateProjectHandler,
   testProject: OnUpdateProjectHandler,
   debug: boolean = false): Promise<void> {
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

   let { project, source } = await full(cfg, debug)

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
}

export async function projectTest(
   description: string,
   updateProject: OnUpdateProjectHandler,
   testProject: OnUpdateProjectHandler): Promise<void> {
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

      let project = await create(cfg)

      let namespace = await project.get<INamespace>(QualifiedObjectType.Namespace, 'namespace')
      let model = await project.get<INamespace>(QualifiedObjectType.Namespace, 'model')
      let instance = await project.get<INamespace>(QualifiedObjectType.Namespace, 'instance')

      let parents: ParentNamespaces = {
         //@ts-ignore
         namespace,
         //@ts-ignore
         model,
         //@ts-ignore
         instance
      }

      await updateProject(project, parents)
      await testProject(project, parents)
   })
}