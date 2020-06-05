export class FieldEvents {
   readonly AttachmentChanging: string = 'field-attachment-changing'
   readonly AttachmentChanged: string = 'field-attachment-changed'
   readonly InheritedChanging: string = 'field-inherited-changing'
   readonly InheritedChanged: string = 'field-inherited-changed'
   readonly ResetStart: string = 'field-reset-start'
   readonly ResetEnd: string = 'field-reset-end'
   readonly ValueChanging: string = 'field-value-changing'
   readonly ValueChanged: string = 'field-value-changed'  
}

export class FieldCollectionEvents {
   readonly Adding: string = 'fieldcollection-field-adding'
   readonly Added: string = 'fieldcollection-field-added'
   readonly Moving: string = 'fieldcollection-field-moving'
   readonly Moved: string = 'fieldcollection-field-moved'
   readonly Removing: string = 'fieldcollection-field-removing'
   readonly Removed: string = 'fieldcollection-field-removed'
   readonly ValueChanging: string =  'fieldcollection-field-value-changing'
   readonly ValueChanged: string = 'fieldcollection-field-value-changed'  
}

export class InstanceEvents {
   readonly FieldAdding: string = 'instance-field-adding'
   readonly FieldAdded: string = 'instance-field-added'
   readonly FieldInheritedChanging: string = 'instance-field-inherited-changing'
   readonly FieldInheritedChanged: string = 'instance-field-inherited-changed'
   readonly FieldMoving: string = 'instance-field-moving'
   readonly FieldMoved: string = 'instance-field-moved'
   readonly FieldNameChanged: string = 'instance-field-name-changed'
   readonly FieldRemoving: string = 'instance-field-removing'
   readonly FieldRemoved: string = 'instance-field-removed'
   readonly FieldResetStart: string = 'instance-field-reset-start'
   readonly FieldResetEnd: string = 'instance-field-reset-end'
   readonly FieldValueChanging: string = 'instance-field-value-changing'
   readonly FieldValueChanged: string = 'instance-field-value-changed'  
}

export class InstanceCollectionEvents {
   readonly Adding: string = 'instance-adding'
   readonly Added: string = 'instance-added'
   readonly Moving: string = 'instance-moving'
   readonly Moved: string = 'instance-moved'
   readonly Removing: string = 'instance-removing'
   readonly Removed: string = 'instance-removed'
}

export class MemberEvents {
   readonly NameChanging: string = 'member-name-changing'
   readonly NameChanged: string = 'member-name-changed'
   readonly ValueChanging: string = 'member-value-changing'
   readonly ValueChanged: string = 'member-value-changed'
}

export class MemberCollectionEvents {
   readonly Adding: string = 'membercollection-member-adding'
   readonly Added: string = 'membercollection-member-added'
   readonly Moving: string = 'membercollection-member-moving'
   readonly Moved: string = 'membercollection-member-moved'
   readonly Removing: string = 'membercollection-member-removing'
   readonly Removed: string = 'membercollection-member-removed'
   readonly ValueChanging: string = 'membercollection-member-value-changing'
   readonly ValueChanged:string = 'membercollection-member-value-changed'
}

export class ModelEvents {
   readonly MemberAdding: string = 'model-member-adding'
   readonly MemberAdded: string = 'model-member-added'
   readonly MemberMoving: string = 'model-member-moving'
   readonly MemberMoved: string = 'model-member-moved'
   readonly MemberRemoving: string = 'model-member-removing'
   readonly MemberRemoved: string = 'model-member-removed'
   readonly ValueChanging: string = 'model-member-valueChanging'
   readonly ValueChanged: string = 'model-member-valueChanged'  
}

export class ModelCollectionEvents {
   readonly Adding: string = 'model-adding'
   readonly Added: string = 'model-added'
   readonly Moving: string = 'model-moving'
   readonly Moved: string = 'model-moved'
   readonly Removing: string = 'model-removing'
   readonly Removed: string = 'model-removed'  
}

export class NamespaceEvents {
   readonly ChildAdding: string = 'namespace-child-adding'
   readonly ChildAdded: string = 'namespace-child-added'
   readonly ChildMoving: string = 'namespace-child-moving'
   readonly ChildMoved: string = 'namespace-child-moved'
   readonly ChildRemoving: string = 'namespace-child-removing'
   readonly ChildRemoved: string = 'namespace-child-removed'
   readonly InstanceAdding: string = 'namespace-instance-adding'
   readonly InstanceAdded: string = 'namespace-instance-added'
   readonly InstanceMoving: string = 'namespace-instance-moving'
   readonly InstanceMoved: string = 'namespace-instance-moved'
   readonly InstanceRemoving: string = 'namespace-instance-removing'
   readonly InstanceRemoved: string = 'namespace-instance-removed'
   readonly ModelAdding: string = 'namespace-model-adding'
   readonly ModelAdded: string = 'namespace-model-added'
   readonly ModelMoving: string = 'namespace-model-moving'
   readonly ModelMoved: string = 'namespace-model-moved'
   readonly ModelRemoving: string = 'namespace-model-removing'
   readonly ModelRemoved: string = 'namespace-model-removed'
}

export class NamespaceCollectionEvents {
   readonly Adding: string = 'namespace-adding'
   readonly Added: string = 'namespace-added'
   readonly Moving: string = 'namespace-moving'
   readonly Moved: string = 'namespace-moved'
   readonly Removing: string = 'namespace-removing'
   readonly Removed: string = 'namespace-removed'  
}

export class ProjectEvents {
   readonly Committing: string = 'project-committing'
   readonly Committed: string = 'project-committed'
   readonly Opening: string = 'project-opening'
   readonly Opened: string = 'project-opened'
}

export class QualifiedObjectEvents {
   readonly Disposing: string = 'qualifiedobject-disposing'
   readonly Disposed: string = 'qualifiedobject-disposed'
   readonly NameChanging: string = 'qualifiedobject-name-changing'
   readonly NameChanged: string = 'qualifiedobject-name-changed'
   readonly ParentChanging: string = 'qualifiedobject-parent-changing'
   readonly ParentChanged: string = 'qualifiedobject-parent-changed'
}

export class Events {
   static readonly Field: FieldEvents = new FieldEvents()
   static readonly FieldCollection: FieldCollectionEvents = new FieldCollectionEvents()
   static readonly Instance: InstanceEvents = new InstanceEvents()
   static readonly InstanceCollection: InstanceCollectionEvents = new InstanceCollectionEvents()
   static readonly Member: MemberEvents = new MemberEvents()
   static readonly MemberCollection: MemberCollectionEvents = new MemberCollectionEvents()
   static readonly Model: ModelEvents = new ModelEvents()
   static readonly ModelCollection: ModelCollectionEvents = new ModelCollectionEvents()
   static readonly Namespace: NamespaceEvents = new NamespaceEvents()
   static readonly NamespaceCollection: NamespaceCollectionEvents = new NamespaceCollectionEvents()
   static readonly Project: ProjectEvents = new ProjectEvents()
   static readonly QualifiedObject = new QualifiedObjectEvents()
}