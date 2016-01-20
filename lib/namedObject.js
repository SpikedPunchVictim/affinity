'use strict';

var EventEmitter = require('./eventEmitter.js');
var Events = require('./events.js');

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
        this.emit(Events.nameChanging, change);
    }
    
    _onNameChanged(change) {
        this.emit(Events.nameChanged, change);
    }
}

module.exports = NamedObject;