var util = requires('utils');
var EventEmitter = require('events').EventEmitter
var MemberCollection = require('./collections/memberCollection.js');
var QualifiedObject = require('./qualifiedObject.js');

function Model(name, parent) {
    EventEmitter.call(this);
    QualifiedObject.mixin(this, name, parent);
    this._name = name;
    this._parent = parent;
    this._members = new MemberCollection();
}

util.inherits(Model, EventEmitter);

Object.defineProperty(Model, 'members', {
    get: function() {
        return this._members;
    }
});
