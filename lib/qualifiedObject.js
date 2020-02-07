'use strict';

var NamedObject = require('./namedObject.js');
var Events = require('./events.js');

// The QualifiedObject represents an object in the namespacing scheme
class QualifiedObject extends NamedObject {
    // parent: QualifiedObject
    //      This object's parent in the Qualified Tree
    constructor(name, parent) {
        super(name);
        this._parent = parent;
    }

    get parent() {
        return this._parent;
    }

    set parent(value) {
        if(this._parent === value) {
            return;
        }

        var change = {
            from: this._parent,
            to: value
        }

        this.emit(Events.parentChanging, change);
        this._parent = value;
        this.emit(Events.parentChanged, change);
    }

    // Gets the Object's Qualified Name
    get qualifiedName() {
        var results = [];
        results.push(this._name);

        var current = this._parent;

        while(current != null) {
            if(current.name.length > 0) {
               results.unshift(current.name); 
            }
            
            current = current.parent;
        }

        return results.join('.'); 
    }
}

module.exports = QualifiedObject;