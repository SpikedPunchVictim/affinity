var util = require('util');
var NamedObject = require('./namedObject.js');
var EventEmitter = require('events').EventEmitter;

module.exports = QualifiedObject;
module.exports.mixin = function mixin(dest) {
    if(dest) {
        var self = dest;
        dest._parent = null;

        NamedObject.mixin(dest);

        Object.defineProperty(dest, 'parent', {
            get: function() {
                return self._parent;
            },

            set: function(value) {
                if(self._parent === value) {
                    return;
                }

                var change = {
                    from: self._parent,
                    to: value
                };

                self.emit('parent-changing', change);
                self._parent = value;
                self.emit('parent-changed', change);
            }
        });

        Object.defineProperty(dest, 'qualifiedName', {
            get: function() {
                var results = [];
                results.push(this._name);

                var current = this._parent;

                while(current != null) {
                    results.unshift(current.name);
                    current = current.parent;
                }

                return results.join('.');
            }
        });
    }
};

//------------------------------------------------------------------------
// This class represents an object with a Qualified Name belonging in a
// Namespaced tree.
//
// parent: QualifiedObject
//------------------------------------------------------------------------
function QualifiedObject(localName, parent) {
    EventEmitter.call(this);
    NamedObject.mixin(this);
    mixin(this);
}

util.inherits(QualifiedObject, EventEmitter);