var util = require('util');
var utility = require('./utility.js');
var EventEmitter = require('./eventEmitter');
var MemberCollection = require('./collections/memberCollection.js');
var QualifiedObject = require('./qualifiedObject.js');

module.exports = Model;
module.exports.events = events;

var events = {
    adding: 'model-member-adding',
    added: 'model-member-adding',
    removing: 'model-member-adding',
    removed: 'model-member-adding',
    valueChanging:
    valueChanged
};

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
    EventEmitter.mixin(this);
    QualifiedObject.mixin(this);
    this._name = name;
    this._namespace = nspace;

    Object.defineProperty(this, 'context', {
        get: function() {
            return this._namespace.context;
        }
    });

    this.members = new MemberCollection(this);

    this.forward = utility.events.forward({
        events: ['model-member-adding', 'model-member-added', 'model-member-removing', 'model-member-removed', 'model-member-value-changed'],
        source: this.members,
        dest: this
    });

    this.forward.subscribe();
}

//------------------------------------------------------------------------
Model.prototype.dispose = function dispose() {
   this.forward.unsubscribe();
};