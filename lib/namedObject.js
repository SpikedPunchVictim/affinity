'use strict';

var EventEmitter = require('./eventEmitter.js');

var events = {
    namechanging: 'name-changing',
    nameChanged: 'name-changed'
}

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


        this._onNameChanging(change);
        this._name = value;
        this._onNameChanged(change);
    }
    
    _onNameChanging(change) {
        this.emit('name-chaning', change);
    }
    
    _onNameChanged(change) {
        this.emit('name-changed', change);
    }
}

module.exports = {
    NamedObject: NamedObject,
    events: events
}