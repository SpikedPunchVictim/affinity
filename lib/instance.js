'use strict';

var MemberCollection = require('./collections/memberCollection.js');
var QualifiedObject = require('./qualifiedObject.js');
var FieldCollection = require('./collections/fieldCollection.js');
var Events = require('./events.js');

class Instance extends QualifiedObject {
    constructor(name, namespace, model) {
        super(name, namespace);
        
        this._model = model;
        this._fields = new FieldCollection(this);
        
        model.on(Events.model.memberAdded, this._onMemberAdded.bind(this));
        model.on(Events.model.memberMoved, this._onMemberMoved.bind(this));
        model.on(Events.model.memberRemoved, this._onMemberRemoved.bind(this));
        
        var self = this;
        this._subs = this._fields.sub([
            { event: Events.fieldCollection.adding, handler: items => self._emitEvent(Events.instance.fieldAdding, items) },
            { event: Events.fieldCollection.added, handler: items => self._emitEvent(Events.instance.fieldAdded, items) },
            { event: Events.fieldCollection.moving, handler: items => self._emitEvent(Events.instance.fieldMoving, items) },
            { event: Events.fieldCollection.moved, handler: items => self._emitEvent(Events.instance.fieldMoved, items) },
            { event: Events.fieldCollection.removing, handler: items => self._emitEvent(Events.instance.fieldRemoving, items) },
            { event: Events.fieldCollection.removed, handler: items => self._emitEvent(Events.instance.fieldRemoved, items) }            
        ]);
        
        this._subItems = this._fields.subItems([
            { event: Events.field.inheritedChanging, handler: items => self._emitEvent(Events.instance.fieldInheritedChanging, items) },
            { event: Events.field.inheritedChanged, handler: items => self._emitEvent(Events.instance.fieldInheritedChanged, items) },
            { event: Events.field.resetStart, handler: items => self._emitEvent(Events.instance.fieldResetStart, items) },
            { event: Events.field.resetEnd, handler: items => self._emitEvent(Events.instance.fieldResetEnd, items) },
            { event: Events.field.valueChanging, handler: items => self._emitEvent(Events.instance.fieldValueChanging, items) },
            { event: Events.field.valueChanged, handler: items => self._emitEvent(Events.instance.fieldValueChanged, items) }
        ]);
    }
    
    dispose() {
        this._subs.off();
        this._subs = null;
        this._subItems.off();
        this._subItems = null;
        this._model.off(Events.model.memberAdded, this._onMemberAdded);
        this._model.off(Events.model.memberMoved, this._onMemberMoved);
        this._model.off(Events.model.memberRemoved, this._onMemberRemoved);
    }
    
    get context() {
        return this.parent.context;
    }
    
    get model() {
        return this._model;
    }
    
    get fields() {
        return this._fields;
    }
    
    _emitEvent() {
        var args = [];
        for(var i = 0; i < arguments.length; ++i) {
            args[i] = arguments[i];
        }        
        
        this.context.project.emit.apply(this, args);
        this.emit.apply(this, args);
    }
    
    //------------------------------------------------------------------------
    _addField(member, index) {
        this._fields.new(member, index);
    }

    //------------------------------------------------------------------------
    _onMemberAdded(items) {
        items.sort((a, b) => {
            if(a.index > b.index) return 1;
            if(a.index < b.index) return -1;
            return 0;
        });

        for(var i = 0; i < items.length; i++) {
            this._addField(items[i].item, items[i].index);
        }
    }

    //------------------------------------------------------------------------
    _onMemberRemoved(items) {
        // Sort highest index first (safe for multiple removals)
        items.sort((a, b)  => {
            if(a.index < b.index) return 1;
            if(a.index > b.index) return -1;
            return 0;
        });

        for(var i = 0; i < items.length; i++) {
            this._fields.splice(items[i].index, 1);
        }
    }
    
    //------------------------------------------------------------------------
    _onMemberMoved(items) {
        for(let item of items) {
            this._fields.move(item.from, item.to);
        }
    }

}

module.exports = Instance;

/*
module.exports = Instance;

function Instance(name, nspace, model) {
    if(model == null) {
        throw new Error(util.format('model must be valid when creating an instance (name: %s)',name));
    }

    Emitter(this);
    QualifiedObject.mixin(this);

    this._name = name;  // 'Inherited' from NamedObject
    this._namespace = nspace;  // 'Inherited' from QualifiedObject
    this.model = model;

    Object.defineProperty(this, 'context', {
        get: function() {
            return this._namespace.context;
        }
    });

    this.members = new InstanceMemberCollection(this, model);

    this.model.members.on(MemberCollection.events.added, this._onMemberAdded.bind(this));
    this.model.members.on(MemberCollection.events.removed, this._onMemberRemoved.bind(this));  

    for(var i = 0; i < this.model.members.length; i++) {
        this._addMember(this.model.members[i], i);
    }
}

//------------------------------------------------------------------------
// List of supported events
Instance.events = {
    adding: 'instance-member-adding',
    added: 'instance-member-adding',
    removing: 'instance-member-adding',
    removed: 'instance-member-adding',
    nameChanged: 'instance-name-changed',
    valueChanging: 'instance-member-value-changing',
    valueChanged: 'instance-member-value-changed'
};

//------------------------------------------------------------------------
Instance.prototype.dispose = function dispose() {
    this.syncObj.dispose();
    this.model.members.removeListener(MemberCollection.events.added, this._onMemberAdded, this);
    this.model.members.removeListener(MemberCollection.events.removed, this._onMemberRemoved, this);  
}

//------------------------------------------------------------------------
Instance.prototype._addMember = function _addMember(modelMember, index) {
    this.members.insert(modelMember.name, modelMember.type, modelMember.value, index);
}

//------------------------------------------------------------------------
Instance.prototype._onMemberAdded = function _onMemberAdded(items) {
    items.sort(function(a, b) {
        if(a.index > b.index) return 1;
        if(a.index < b.index) return -1;
        return 0;
    });

    for(var i = 0; i < items.length; i++) {
        this._addMember(items[i].item, items[i].index);
    }
}

//------------------------------------------------------------------------
Instance.prototype._onMemberRemoved = function _onMemberRemoved(items) {
    // Sort highest index first (safe for multiple removals)
    items.sort(function(a, b) {
        if(a.index < b.index) return 1;
        if(a.index > b.index) return -1;
        return 0;
    });

    for(var i = 0; i < items.length; i++) {
        this.members.splice(items[i].index, 1);
    }
}

//------------------------------------------------------------------------
Instance.prototype._onNameChange = function _onNameChange(from, to) {
    this.context.project.emit('instance-name-changing');

    var command = new commands.SetInstanceNameCommand(this, to);
    command.execute();
    this.context.undostack.add(command);

    this.context.project.emit(Instance.events.nameChanged);
}
*/