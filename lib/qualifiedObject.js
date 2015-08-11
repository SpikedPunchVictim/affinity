var util = require('util');
var NamedObject = require('./namedObject.js');
var Emitter = require('./eventEmitter.js');

module.exports = QualifiedObject;
module.exports.mixin = function mixin(dest) {
    if(dest) {
        var self = dest;
        dest._namespace = null;

        NamedObject.mixin(dest);

        Object.defineProperty(dest, 'parent', {
            get: function() {
                return self._namespace;
            },

            set: function(value) {
                if(self._namespace === value) {
                    return;
                }

                var change = {
                    source: self,
                    from: self._namespace,
                    to: value
                };

                self.emit('parent-changing', change);

                // if(typeof self._onParentChanging === 'function') {
                //     self._onParentChanging(change);
                // }
                
                self._onParentChange(from, to);

                // Note: Need more use cases to determine  if we need a pre & post changing/ed callbacks
                // if(typeof self._onParentChanged === 'function') {
                //     self._onParentChanged(change);
                // }

                self.emit('parent-changed', change);
            }
        });

        Object.defineProperty(dest, 'qualifiedName', {
            get: function() {
                var results = [];
                results.push(this._name);

                var current = this._namespace;

                while(current != null) {
                    results.unshift(current.name);
                    current = current.namespace;
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
    Emitter.mixin(this);
    NamedObject.mixin(this);
    mixin(this);
}