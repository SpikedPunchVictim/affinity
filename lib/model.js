var util = require('util');
var EventEmitter = require('events').EventEmitter
var MemberCollection = require('./collections/memberCollection.js');
var QualifiedObject = require('./qualifiedObject.js');

module.exports = Model;

function Model(name, nspace) {
    EventEmitter.call(this);
    QualifiedObject.mixin(this, name, nspace);
    this._name = name;
    this._nspace = nspace;
    this._members = new MemberCollection();
//  - 'items-adding'
//  - 'items-added'
//  - 'items-removing'
//  - 'items'removed


    this._members.on('items-added', function(items) {

    });

    Object.defineProperty(this, 'members', {
        get: function() {
            return this._members;
        }
    });
}

util.inherits(Model, EventEmitter);