'use strict';

// var InstanceMemberCollection = require('./collections/instanceMemberCollection.js');
// var ObservableCollection = require('./collections/observableCollection.js');
var MemberCollection = require('./collections/memberCollection.js');
var QualifiedObject = require('./qualifiedObject.js');
var FieldCollection = require('./collections/fieldCollection.js');
// var InstanceMember = require('./instanceMember.js');
// var util = require('util');
// var _ = require('lodash');
// var EventEmitter = require('events').EventEmitter;
// //var Emitter = require('./eventEmitter.js');
// var Emitter = require('event-emitter');
// Emitter.pipe = require('event-emitter/pipe');

var events = {
    adding: 'instance-member-adding',
    added: 'instance-member-adding',
    moving: 'instance-field-moving',
    moved: 'instance-field-moved',
    removing: 'instance-member-adding',
    removed: 'instance-member-adding',
    nameChanged: 'instance-name-changed',
    valueChanging: 'instance-member-value-changing',
    valueChanged: 'instance-member-value-changed'
};

class Instance extends QualifiedObject {
    constructor(name, parent, model) {
        super(name, parent);
        
        this._model = model;
        this._fields = new FieldCollection.FieldColection(this);
        
        var self = this;
        this._sub = this._fields.sub([
          { event: FieldCollection.events.adding, handler: items => self._emitEvent(events.adding, items) },  
          { event: FieldCollection.events.added, handler: items => self._emitEvent(events.added, items) },
          { event: FieldCollection.events.moving, handler: items => self._emitEvent(events.moving, items) },  
          { event: FieldCollection.events.moved, handler: items => self._emitEvent(events.moved, items) },
          { event: FieldCollection.events.removing, handler: items => self._emitEvent(events.removing, items) }, 
          { event: FieldCollection.events.removed, handler: items => self._emitEvent(events.removed, items) }            
        ]);
        
        this._modelSub = this._model.members.sub([
          { event: MemberCollection.events.adding, handler: items => self._emitEvent(events.adding, items) },  
          { event: MemberCollection.events.added, handler: items => self._emitEvent(events.added, items) },
          { event: MemberCollection.events.moving, handler: items => self._emitEvent(events.moving, items) },  
          { event: MemberCollection.events.moved, handler: items => self._emitEvent(events.moved, items) }, 
          { event: MemberCollection.events.removing, handler: items => self._emitEvent(events.removing, items) }, 
          { event: MemberCollection.events.removed, handler: items => self._emitEvent(events.removed, items) }
        ]);
        
        // [REMOVE]
        for(var member of this._model.members) {
            console.log(member.name);
        }
    }
    
    dispose() {
        this._sub.off();
        this._modelSub.off();
    }
    
    get context() {
        return this.parent.context;
    }
    
    get model() {
        return this._model;
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
        this.members.insert(member.name, member.type, member.value, index);
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
            this.members.splice(items[i].index, 1);
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