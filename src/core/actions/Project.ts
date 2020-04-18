import { RfcAction } from "./Actions"
import { IProject } from "../Project"


export class ProjectOpenAction extends RfcAction {
   static readonly type: string = 'project-open'
   readonly type: string = ProjectOpenAction.type
   readonly project: IProject

   constructor(project: IProject) {
      super(ProjectOpenAction.type)
      this.project = project
   }
}

export class ProjectCommitAction extends RfcAction {
   static readonly type: string = 'project-commit'
   readonly type: string = ProjectOpenAction.type
   readonly project: IProject

   constructor(project: IProject) {
      super(ProjectOpenAction.type)
      this.project = project
   }
}