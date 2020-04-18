import { IActionRouter } from "../actions/ActionRouter"
import { IProject } from "../Project"

export interface IPlugin {
   readonly name: string
   setup(project: IProject, router: IActionRouter): Promise<void>
}