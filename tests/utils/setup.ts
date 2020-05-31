import { IProject } from "../../src/core/Project"
import { create } from "./create"
import { DebugPlugin, DataPlugin } from "./plugin"

type TestSetup = {
   project: IProject,
   source: IProject
}

export async function full(config: any, debug: boolean = false): Promise<TestSetup> {
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