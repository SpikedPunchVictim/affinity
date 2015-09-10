var util = require('util');
var _ = require('lodash');
var utility = require('./utility.js');
//var Emitter = require('./eventEmitter.js');
var MemberCollection = require('./collections/memberCollection.js');
var QualifiedObject = require('./qualifiedObject.js');
var Emitter = require('event-emitter');
Emitter.pipe = require('event-emitter/pipe');

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
    Emitter(this);
    QualifiedObject.mixin(this);
    
    this._name = name;
    this._namespace = nspace;

    Object.defineProperty(this, 'context', {
        get: function() {
            return this._namespace.context;
        }
    });

    this.members = new MemberCollection(this);

    // Setup event forwarding
    // this.members.forward(this, MemberCollection.events.adding, function(changed) {
    //     _.each(changed, function(it) {
    //         it.item.on()
    //     })
    //     var self = this;

    //     // TODO: Stopped here
    //     _.each(changed, function(it) {
    //         it.item.on('value-changing', function() {
    //             self.emit(Model.events.valueChanging);
    //         });
    //     });
    // });

    this.members.on(MemberCollection.events.adding, function(items) {
        var self = this;
        _.each(items, function(it) {
            self._registerMember(it.item);
        });
    });

    // event-emitter
    this.membersPipe = Emitter.pipe(this.members, this);
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
    member.on('value-changing', function(value) {
        this.emit(Model.events.valueChanging, value);
    });

    member.on('value-changed', function(value) {
        this.emit(Model.events.valueChanging, value);
    });
}

//------------------------------------------------------------------------
Model.prototype._unregisterMember = function _unregisterMember(member) {
    
}

//------------------------------------------------------------------------
Model._onMemberValueChanging = function _onValueChanging(model, member) {
    model.emit(Model.events.valueChanging, member)
}
