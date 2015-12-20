'use strict';

var EventEmitter = require('./eventEmitter.js');

// This class is designed to be a mixin for classes that
// want support for a name field that raises events when 
// the name changes
class NamedObject {
    constructor(name) {
        EventEmitter.mixin(this);
        this._name = name;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        if(this._name === value) {
            return;
        }

        var change = {
                from: this._name,
                to: value
            };


        this.emit('name-chaning', change);
        this._name = value;
        this.emit('name-changed', change);
    }
}

module.exports = NamedObject;