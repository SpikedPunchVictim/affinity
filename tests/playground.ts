import { Switch, QualifiedObjectType } from "../src/core/utils/Types"
import { populate, create } from "./utils/create"
import { INamespace } from "../src/core/Namespace"
import { DataPlugin, DebugPlugin } from "./utils/plugin"
import { IProject } from "../src/core/Project"

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

async function main() {
   let type = QualifiedObjectType.Namespace

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
      return
   }

   let collection = await Switch.onType(type, {
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

   console.log(`0: Before we get()`)
   let three = await collection.get('three')
   console.log(`REMOVE: three has returned!`)
   let four = await collection.get('four')

   console.log(three.name)
   console.log(four.name)
}

main()
   .then(() => process.exit(0))