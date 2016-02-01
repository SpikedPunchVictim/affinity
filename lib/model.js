'use strict';

var _ = require('lodash');
var MemberCollection = require('./collections/memberCollection.js');
var QualifiedObject = require('./qualifiedObject.js');
var Events = require('./events.js');

class Model extends QualifiedObject {
    constructor(name, namespace) {
        super(name, namespace);

        this._members = new MemberCollection(this);
        
        // Forward events
        var self = this;
        this._sub = this._members.sub([
            { event: Events.memberCollection.adding, handler: items => self._emitEvent(Events.model.memberAdding, items) },
            { event: Events.memberCollection.added, handler: items => self._emitEvent(Events.model.memberAdded, items) },
            { event: Events.memberCollection.moving, handler: items => self._emitEvent(Events.model.memberMoving, items) },
            { event: Events.memberCollection.moved, handler: items => self._emitEvent(Events.model.memberMoved, items) },
            { event: Events.memberCollection.removing, handler: items => self._emitEvent(Events.model.memberRemoving, items) },
            { event: Events.memberCollection.removed, handler: items => self._emitEvent(Events.model.memberRemoved, items) }
        ]);
        
        this._subItems = this._members.subItems([
            { event: Events.memberCollection.valueChanging, handler: items => self._emitEvent(Events.model.valueChanging, items) },
            { event: Events.memberCollection.valueChanged, handler: items => self._emitEvent(Events.model.valueChanged, items) }
        ]);
    }

    get context() {
        return this.parent.context;
    }
    
    dispose() {
        this._emitEvent(Events.disposing, { source: this });
        this._sub.off();
        this._sub = null;
        
        this._subItems.off();
        this._subItems = null;
        this._emitEvent(Events.disposed, { source: this });
    }
    
    get members() {
        return this._members;
    }
    
    _emitEvent() {
        var args = [];
        for(var i = 0; i < arguments.length; ++i) {
            args[i] = arguments[i];
        }        
        
        this.context.project.emit.apply(this.context.project, args);
        this.emit.apply(this, args);
    }
}

module.exports = Model;

//------------------------------------------------------------------------
// Events:
//  - model-member-adding
//  - model-member-added
//  - model-member-removing
//  - model-member-removed
//  - model-member-value-changed
//
//------------------------------------------------------------------------
/*
function Model(name, nspace) {
    Emitter.mixin(this);
    QualifiedObject.mixin(this);
    
    this._name = name;
    this._namespace = nspace;

    Object.defineProperty(this, 'context', {
        get: function() {
            return this._namespace.context;
        }
    });

    this.members = new MemberCollection(this);

    this.members.on(MemberCollection.events.added, this._onMembersAdded.bind(this));
    this.members.on(MemberCollection.events.removed, this._onMembersRemoved.bind(this));

    // event-emitter
    this.membersPipe = Emitter.chain(this.members, this);
}

//------------------------------------------------------------------------
// List of supported events
Model.events = {
    adding: MemberCollection.events.adding,
    added: MemberCollection.events.added,
    removing: MemberCollection.events.removing,
    removed: MemberCollection.events.removed,
    valueChanging: MemberCollection.events.valueChanging,
    valueChanged: MemberCollection.events.valueChanged
}

//------------------------------------------------------------------------
Model.prototype.dispose = function dispose() {
    this.membersPipe.close();
    this.members.off(MemberCollection.events.added, this._onMembersAdded);
    this.members.off(MemberCollection.events.removed, this._onMembersRemoved);
    //this.members.forward_unbind(this);
};

//------------------------------------------------------------------------
Model.prototype._onNameChange = function _onNameChange(from, to) {
    this.context.project.emit('model-name-changing');

    var command = new Commands.SetModelNameCommand(this, to);
    command.execute();
    this.context.undostack.add(command);

    this.context.project.emit('model-name-changed');
}

//------------------------------------------------------------------------
Model.prototype._registerMember = function _registerMember(member) {
    member.on(ModelMember.events.valueChanging, this._onMemberValueChanging.bind(this));
    member.on(ModelMember.events.valueChanged, this._onMemberValueChanged.bind(this));
}

//------------------------------------------------------------------------
Model.prototype._unregisterMember = function _unregisterMember(member) {
    member.off(ModelMember.events.valueChanging, this._onMemberValueChanging.bind(this));
    member.off(ModelMember.events.valueChanged, this._onMemberValueChanged.bind(this));
}

//------------------------------------------------------------------------
// change contains:
//  member: the Member raising the event
//  from: the current value
//  to: the next value
Model.prototype._onMemberValueChanging = function _onValueChanging(change) {
    this.emit(Model.events.valueChanging, change)
}

//------------------------------------------------------------------------
Model.prototype._onMemberValueChanged = function _onMemberValueChanged(change) {
    this.emit(Model.events.valueChanged, change)
}

//------------------------------------------------------------------------
Model.prototype._onMembersAdded = function _onMembersAdded(members) {
    _.each(members, function(it) {
        this._registerMember(it.item);
    }, this);
}

//------------------------------------------------------------------------
Model.prototype._onMembersRemoved = function _onMembersRemoved(members) {
    _.each(members, function(it) {
        this._unregisterMember(it.item);
    }, this);
}
*/
