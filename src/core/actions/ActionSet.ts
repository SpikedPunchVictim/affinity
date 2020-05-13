/*
Notes:
   * GetActions retrieve QualifiedObjects under the provided parent
*/

export enum ActionSet {
   InstanceCreate = 'instance-create',
   InstanceDelete = 'instance-delete',
   InstanceGet = 'instance-get',
   InstanceMove = 'instance-move',
   InstanceRename = 'instance-rename',
   InstanceReorder = 'instance-reoder',
   FieldCreate = 'field-create',
   FieldDelete = 'field-delete',
   FieldRename = 'field-rename',
   FieldReorder = 'field-reorder',
   FieldValueChange = 'field-value-change',
   ModelCreate = 'model-create',
   ModelDelete = 'model-delete',
   ModelGet = 'model-get',
   ModelMove = 'model-move',
   ModelRename = 'model-rename',
   ModelReorder = 'model-reorder',
   MemberCreate = 'member-create',
   MemberDelete = 'member-delete',
   MemberRename = 'member-rename',
   MemberReorder = 'member-reorder',
   MemberValueChange = 'member-value-change',
   NamespaceCreate = 'namespace-create',
   NamespaceDelete = 'namespace-delete',
   NamespaceGet = 'namespace-get',
   NamespaceMove = 'namespace-move',
   NamespaceRename = 'namespace-rename',
   NamespaceReorder = 'namespace-reorder',
   ParentChange = 'qualifiedobject-parent-change',
   ProjectCommit = 'project-commit',
   ProjectOpen = 'project-open'
}