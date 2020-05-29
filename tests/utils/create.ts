import { Project, IProject } from "../../src/core/Project"
import { basename, parentPath, QualifiedObjectType } from "../../src/core/utils"
import { TestUidWarden } from "./uid"

/**
 * Basic version of a project populator
 * 
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

/**
 * Advanced version of a project populator
 * 
 * Example:
 * 
 *    let project = await populate({
 *       namespaces: [
 *          { path: 'one.two', id: "2" },
 *          { path: 'three.four.five', id: "5" }
 *       ],
 *       models: [
 *          { path: 'one.model', id: "3" }
 *       ],
 *       instances: [
 *          { path: 'one.instance', id: "4" }
 *       ] 
 *    })
 * 
 * @param config {object} An object with the following
 *    - namespaces {Array<{ path: "", id: "" }>}
 *    - models {Array<{ path: "", id: "" }>}
 *    - instances {Array<{ path: "", id: "" }>}
 */
export async function create(config: any, name: string = 'test'): Promise<IProject> {
   let warden = new TestUidWarden()

   let project = new Project(name, {
      rootId: 'root',
      uidWarden: warden
   })

   let namespaces = config.namespaces || []
   let models = config.models || []
   let instances = config.instances || []

   for(let item of namespaces) {
      warden.add(QualifiedObjectType.Namespace, item.path, item.id)
      await project.create(item.path)
   }

   for(let item of models) {
      warden.add(QualifiedObjectType.Model, item.path, item.id)
      let base = basename(item.path)
      let pPath = parentPath(item.path)

      if(pPath === undefined) {
         throw new Error(`pPath is undefined`)
      }

      let nspace = await project.create(pPath)
      await nspace.models.create(base)
   }

   for(let item of instances) {
      warden.add(QualifiedObjectType.Instance, item.path, item.id)
      let base = basename(item.path)
      let pPath = parentPath(item.path)

      if(pPath === undefined) {
         throw new Error(`pPath is undefined`)
      }

      let nspace = await project.create(pPath)
      let model = await nspace.models.create(base)
      await nspace.instances.create(base, model)
   }

   return project
}

export async function populate(project: IProject, config: any): Promise<void> {
   let warden = project.uidWarden as TestUidWarden

   let namespaces = config.namespaces || []
   let models = config.models || []
   let instances = config.instances || []

   for(let item of namespaces) {
      if(!item.id) {
         item.id = await warden.generate()
      }

      warden.add(QualifiedObjectType.Namespace, item.path, item.id)
      await project.create(item.path)
   }

   for(let item of models) {
      if(!item.id) {
         item.id = await warden.generate()
      }

      warden.add(QualifiedObjectType.Model, item.path, item.id)
      let base = basename(item.path)
      let pPath = parentPath(item.path)

      if(pPath === undefined) {
         throw new Error(`pPath is undefined`)
      }

      let nspace = await project.create(pPath)
      await nspace.models.create(base)
   }

   for(let item of instances) {
      if(!item.id) {
         item.id = await warden.generate()
      }
      
      warden.add(QualifiedObjectType.Instance, item.path, item.id)
      let base = basename(item.path)
      let pPath = parentPath(item.path)

      if(pPath === undefined) {
         throw new Error(`pPath is undefined`)
      }

      let nspace = await project.create(pPath)
      let model = await nspace.models.create(base)
      await nspace.instances.create(base, model)
   }
}

/*



populate({
   namespaces: [
      { path: "", id: "" }
   ]
})

*/