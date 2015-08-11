var util = require('util');
var utility = require('./utility.js');
var Emitter = require('./eventEmitter.js');
var MemberCollection = require('./collections/memberCollection.js');
var QualifiedObject = require('./qualifiedObject.js');

module.exports = Model;
module.exports.events = events;

var events = {
    adding: 'model-member-adding',
    added: 'model-member-adding',
    removing: 'model-member-adding',
    removed: 'model-member-adding',
    valueChanging: 'model-member-value-changing',
    valueChanged: 'model-member-value-chnged'
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
    Emitter.mixin(this);
    QualifiedObject.mixin(this);
    
    this._name = name;
    this._namespace = nspace;

    Object.defineProperty(this, 'context', {
        get: function() {
            return this._namespace.context;
        }
    });

    /*
    //
    // Perhaps we should be passing down eventemitters, from their parents.
    // Or something like a consolidated EventEmitter
    // ie
    //
    //
    // function Model(..., context) {
    //    context.emitter.add(this);
    // }
    //
    // function add(dest) {
    //    if(dest instanceof Model) {
    //      var key = util.format('model@%s', dest.qualifiedName);
    //
    //    
    //    } ...
    // 
    //    _.extend(dest, {
    //      on: function(event, listener) {
    //          this.listeners
    //
    //      }
    //
    //    
    //    }, this); // where 'this' is the context
    //    dest.on = function(event, args) {
    //      
    //    }
    //
    //
    //    dest.emit = function(event, args) {
    //      this.project.emit(util.format('model@%s', this._source.qualifiedName), args);
    //      this._emitter.emit(event, args);
    //    }
    // }
    // 
    //
    //
    */
    this.members = new MemberCollection(this);

    this.forward = utility.events.forward({
        events: [events.added, events.adding, events.removing, events.removing, events.valueChanging, events.valueChanged],
        source: this.members,
        dest: this
    });

    this.forward.subscribe();
}

//------------------------------------------------------------------------
Model.prototype.dispose = function dispose() {
   this.forward.unsubscribe();
};

//------------------------------------------------------------------------
Model.prototype._onNameChange = function _onNameChange(from, to) {
    this.context.project.emit('model-name-changing');

    var command = new commands.SetModelNameCommand(this, to);
    command.execute();
    this.context.undostack.add(command);

    this.context.project.emit('model-name-changed');
}