import { Project } from "../../src/core"
import { basename, parentPath } from "../../src/core/utils"

/**
 * Populates a Project
 * @param config {object} An object with the following
 *    - namespaces {Array<string>}
 *    - models {Array<string>}
 *    - instances {Array<string>}
 */
export async function fill(config: any): Promise<Project> {
   let project = new Project('test')

   let namespaces = config.namespaces || []
   let models = config.models || []
   let instances = config.instances || []

   for(let ns of namespaces) {
      await project.create(ns)
   }

   for(let model of models) {
      let base = basename(model)
      let pPath = parentPath(model)

      if(pPath === undefined) {
         throw new Error(`pPath is undefined`)
      }

      let nspace = await project.create(pPath)
      await nspace.models.create(base)
   }

   for(let inst of instances) {
      let base = basename(inst)
      let pPath = parentPath(inst)

      if(pPath === undefined) {
         throw new Error(`pPath is undefined`)
      }

      let nspace = await project.create(pPath)
      let model = await nspace.models.create(base)
      await nspace.instances.create(base, model)
   }

   return project
}