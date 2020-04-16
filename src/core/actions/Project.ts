import { RfcAction } from "./Actions"
import { IProject } from "../Project"


export class ProjectOpen extends RfcAction {
   static readonly type: string = 'project-open'
   readonly type: string = ProjectOpen.type
   readonly project: IProject

   constructor(project: IProject) {
      super(ProjectOpen.type)
      this.project = project
   }
}

export class ProjectCommit extends RfcAction {
   static readonly type: string = 'project-commit'
   readonly type: string = ProjectOpen.type
   readonly project: IProject

   constructor(project: IProject) {
      super(ProjectOpen.type)
      this.project = project
   }
}