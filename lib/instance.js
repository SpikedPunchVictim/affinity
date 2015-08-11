var InstanceMemberCollection = require('./collections/instanceMemberCollection.js');
var ObservableCollection = require('./collections/observableCollection.js');
var QualifiedObject = require('./qualifiedObject.js');
var InstanceMember = require('./instanceMember.js');
var util = require('util');
var utility = require('./utility.js');
var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var Emitter = require('./eventEmitter.js');

module.exports = Instance;

function Instance(name, nspace, model) {
    if(model == null) {
        throw new Error(util.format('model must be valid when creating an instance (name: %s)',name));
    }

    Emitter.mixin(this);
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

    this.model.members.on('added', this._onMemberAdded.bind(this));
    this.model.members.on('removed', this._onMemberRemoved.bind(this));  

    for(var i = 0; i < this.model.members.length; i++) {
        this._addMember(this.model.members[i], i);
    }
}

//------------------------------------------------------------------------
Instance.prototype.dispose = function dispose() {
    this.syncObj.dispose();
    model.members.removeListener('added', this._onMemberAdded, this);
    model.members.removeListener('removed', this._onMemberRemoved, this);  
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

    this.context.project.emit('instance-name-changed');
}