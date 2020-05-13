import { RfcAction } from "./Actions"
import { IProject } from "../Project"
import { ActionSet } from './ActionSet'

export class ProjectOpenAction extends RfcAction {
   static readonly type: string = ActionSet.ProjectOpen
   readonly type: string = ProjectOpenAction.type
   readonly project: IProject

   constructor(project: IProject) {
      super(ProjectOpenAction.type)
      this.project = project
   }
}

export class ProjectCommitAction extends RfcAction {
   static readonly type: string = ActionSet.ProjectCommit
   readonly type: string = ProjectOpenAction.type
   readonly project: IProject

   constructor(project: IProject) {
      super(ProjectOpenAction.type)
      this.project = project
   }
}