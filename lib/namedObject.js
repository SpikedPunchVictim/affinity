'use strict';

var { EventEmitter } = require('./eventEmitter.js');
var Events = require('./events.js');

/**
 * Parent class for objects containing a name field
 * where changes are observed.
 */
class NamedObject extends EventEmitter {
    constructor(name) {
        super()
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
        this.emit(Events.nameChanging, change);
    }
    
    _onNameChanged(change) {
        this.emit(Events.nameChanged, change);
    }
}

module.exports = NamedObject;