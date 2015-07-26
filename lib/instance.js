var InstanceMemberCollection = require('./collections/instanceMemberCollection.js');
var ObservableCollection = require('./collections/observableCollection.js');
var QualifiedObject = require('./qualifiedObject.js');
var InstanceMember = require('./instanceMember.js');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

module.exports = Instance;

function Instance(name, nspace, model) {
    if(model == null) {
        throw new Error(util.format('model must be valid when creating an instance (name: %s)',name));
    }

    EventEmitter.call(this);
    QualifiedObject.mixin(this);

    this._name = name;
    this._parent = nspace;
    this.model = model;

    this.members = new InstanceMemberCollection(this, model);
    
    // Setup the syncing between Model & Instance
    var self = this;
    this.syncObj = ObservableCollection.sync({
        master: self.model.members,
        slave: self.members,
        addSlaveItem: function addSlaveItem(model, modelIndex) {
            this.slave.splice(modelIndex, 0, new InstanceMember(self, model));
        },
        removeSlaveItem: function removeSlaveItem(instanceMember) {
            this.slave.remove(instanceMember);
        },
        compare: function compare(member, instanceMember) {
            return instanceMember.member === member;
        }
    });
}

util.inherits(Instance, EventEmitter);

Instance.prototype.dispose = function dispose() {
    this.syncObj.dispose();
}