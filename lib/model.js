var util = require('util');
var utility = require('./utility.js');
var Emitter = require('./eventEmitter.js');
var MemberCollection = require('./collections/memberCollection.js');
var QualifiedObject = require('./qualifiedObject.js');
var ee = require('event-emitter');

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

    // Setup event forwarding
    this.members.forward(this, MemberCollection.events.adding, function(changed) {
        this.emit(Model.events.adding, changed);
        var self = this;

        // TODO: Stopped here
        _.each(changed, function(it) {
            it.item.on('value-changing', function() {
                self.emit(Model.events.valueChanging);
            });
        });
    });

    this.members.forward(this, MemberCollection.events.added, function(changed) {
        this.emit(Model.events.added, changed);
    });

    this.members.forward(this, MemberCollection.events.removing, function(changed) {
        this.emit(Model.events.removing, changed);
    });

    this.members.forward(this, MemberCollection.events.removed, function(changed) {
        this.emit(Model.events.removed, changed);
    });


    // event-emitter
    ee.pipe(this.members, this);

}

_.extend(Model.prototype, ee);

//------------------------------------------------------------------------
// List of supported events
Model.events = {
    adding: 'model-member-adding',
    added: 'model-member-added',
    removing: 'model-member-removing',
    removed: 'model-member-removed',
    valueChanging: 'model-member-value-changing',
    valueChanged: 'model-member-value-chnged'
}

//------------------------------------------------------------------------
Model.prototype.dispose = function dispose() {
   this.members.forward_unbind(this);
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
Model._onMemberValueChanging = function _onValueChanging(model, member) {
    model.emit(Model.events.valueChanging, member)
}