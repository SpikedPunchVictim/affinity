// This class is designed to be a mixin for classes that
// want support for a name field that raises events when 
// the name changes
module.exports = NamedObject;
var mixin = module.exports.mixin = function mixin(dest) {
    if(dest) {
        var self = dest;
        dest._name = "";

        Object.defineProperty(dest, 'name', {
            __proto__: null,
            enumerable: true,
            get: function() {
                return self._name;
            },

            set: function(value) {
                if(self._name === value) {
                    return;
                }

                var change = {
                    from: self._name,
                    to: value
                };

                self.emit('name-changing', change);
                self._name = value;
                self.emit('name-changed', change);
            }
        });
    }
}

//------------------------------------------------------------------------
// This class represents an object that is named.
// This class is intended to be used as a mixin, and assumes
// that the EventEmitter is part of the prorotype chain.
//
// Events:
//  'name-changing': Raised when thename changes
//  'name-changed': Raised when the name has changed
//------------------------------------------------------------------------
function NamedObject(name) {
    this._name = name;
    mixin(this)
}