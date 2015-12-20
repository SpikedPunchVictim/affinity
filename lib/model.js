'use strict';

var _ = require('lodash');
var Collections = require('./collections/index.js');
var MemberCollection = Collections.MemberCollection;
var QualifiedObject = require('./qualifiedObject.js');
var ModelMember = require('./modelMember.js');
var Commands = require('./commands.js');

var events = {
    adding: MemberCollection.events.adding,
    added: MemberCollection.events.added,
    removing: MemberCollection.events.removing,
    removed: MemberCollection.events.removed,
    valueChanging: MemberCollection.events.valueChanging,
    valueChanged: MemberCollection.events.valueChanged
};


class Model extends QualifiedObject {
    constructor(name, namespace) {
        super(name, namespace);

    // adding: 'model-member-adding',
    // added: 'model-member-added',
    // moving: 'model-member-moving',
    // moved: 'model-member-moved',
    // removing: 'model-member-removing',
    // removed: 'model-member-removed',
    // valueChanging: 'model-member-value-changing',
    // valueChanged:'model-member-value-changed'

        

        this._members = new MemberCollection(this);

        this._subscription = new ObservableCollection.Listener(this._members);
        this._subscription.subscribe(MemberCollection.events.added, items => {

        });

        var mev = MemberCollection.events;
        this._members.on(mev.adding, this._onMemberAdding.bind(this));
        this._members.on(mev.added, this._onMemberAdded.bind(this));
        this._members.on(mev.moving, this._onMemberMoving.bind(this));
        this._members.on(mev.moved, this._onMemberMoved.bind(this));
        this._members.on(mev.removing, this._onMemberRemoving.bind(this));
        this._members.on(mev.removed, this._onMemberRemoved.bind(this));
    }

    get context() {
        return this.namespace.context;
    }
    dispose() {
        this._subscription.unsubscribe();
    }
    
    _emitEvent() {
        var args = [];
        for(var i = 0; i < arguments.length; ++i) {
            args[i] = arguments[i];
        }
        
        
        this.context.project.emit.apply(this, args);
        this.emit.apply(this, args);
    }

    _registerMember(member) {

    }

    _unregisterMember(member) {

    }

    // Event Handlers
    _onMemberAdding(items) {

    }
    
    _onMemberAdded(items) {
        
    }
    
    _onMemberMoving(items) {
        
    }
    
    _onMemberMoved(items) {
        
    }
    
    _onMemberRemoving(items) {
        
    }
    
    _onMemberRemoved(items) {
        
    }
    
    _onMemberValueChanging(items) {
        
    }
    
    _onMemberValueChanged(items) {
        
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
