var util = require('util');
var _ = require('lodash');
var utility = require('./utility.js');
var Emitter = require('./eventEmitter.js');
var MemberCollection = require('./collections/memberCollection.js');
var QualifiedObject = require('./qualifiedObject.js');
var ModelMember = require('./modelMember.js');

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

    var command = new commands.SetModelNameCommand(this, to);
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
    var self = this;
    _.each(members, function(it) {
        self._registerMember(it.item);
    });
}

//------------------------------------------------------------------------
Model.prototype._onMembersRemoved = function _onMembersRemoved(members) {
    var self = this;
    _.each(members, function(it) {
        self._unregisterMember(it.item);
    });
}
