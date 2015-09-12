var util = require('util');
var _ = require('lodash');
var utility = require('./utility.js');
var Emitter = require('./eventEmitter.js');
var MemberCollection = require('./collections/memberCollection.js');
var QualifiedObject = require('./qualifiedObject.js');

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

    this.members.on(MemberCollection.events.adding, this._onMembersAdding);
    this.members.on(MemberCollection.events.removing, this._onMembersRemoving);

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
    this.members.off(MemberCollection.events.adding, this._onMembersAdding);
    this.members.off(MemberCollection.events.removing, this._onMembersRemoving);
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
    member.on(Model.events.valueChanging, this._onMemberValueChanging);
    member.on(Model.events.valueChanged, this._onMemberValueChanged);
}

//------------------------------------------------------------------------
Model.prototype._unregisterMember = function _unregisterMember(member) {
    member.off(Model.events.valueChanging, this._onMemberValueChanging);
    member.off(Model.events.valueChanged, this._onMemberValueChanged);
}

//------------------------------------------------------------------------
Model.prototype._onMemberValueChanging = function _onValueChanging(model, member) {
    model.emit(Model.events.valueChanging, member)
}

//------------------------------------------------------------------------
Model.prototype._onMemberValueChanged = function _onMemberValueChanged(model, member) {
    model.emit(Model.events.valueChanged, member)
}

//------------------------------------------------------------------------
Model.prototype._onMembersAdding = function _onMembersAdding(members) {
    var self = this;
    _.each(members, function(it) {
        self._registerMember(it.item);
    });
}

//------------------------------------------------------------------------
Model.prototype._onMembersRemoving = function _onMembersRemoving(members) {
    var self = this;
    _.each(items, function(it) {
        self._unregisterMember(it.item);
    });
}
