var util = require('util');
var Emitter = require('../eventEmitter.js');
var _ = require('lodash')

var exports = module.exports;

exports.SimpleValue = {
    //------------------------------------------------------------------------
    // Creates the common structure for simple types. Simple types are:
    //  1) bool
    //  2) decimal
    //  3) int
    //  4) string
    //  5) uint
    //
    // options : object
    //
    //  createChangeValueCommand(this, prevValue. nextValue)
    //      Function for creating the ChangeValue command
    //
    //  typeInfo
    //      The Value's typeInfo
    //
    //  validate : function
    //      The Value's validate method
    //
    //  clone() : function
    //      The Value's clone method that is called.
    //
    //  equals(obj) : function
    //      Returns true if 'obj' equals the Value. Otherwise false.
    //------------------------------------------------------------------------
    mixin: function mixin(other, options) {
        Emitter.mixin(other);
        other._value = null;
        var self = other;
        var opts = options;
        
        Object.defineProperty(other, 'type', {
            get: function() { return opts.typeInfo; }
        });
        
        Object.defineProperty(other, 'validate', {
            get: function() { return _.bind(opts.validate, self); }
        });
        
        other.clone = function clone() {
            return _.bind(opts.clone, self)();
        }
        
        other.equals = function equals(obj) {
            return _.bind(opts.equals, self)(obj)
        }
    
        Object.defineProperty(other, 'value', {
            get: function() {
                return self._value;
            },
        
            set: function(value) {
                if(value === self._value) {
                    return;
                }
        
                console.log('%j (%j)', self.validate, value)
                self.validate(value);
        
                var command = _.bind(opts.createChangeValueCommand, self)(self, self._value, value)
                command.apply();
            }
        });
        
        other._setValue = function _setValue(value) {
            if(value === self._value) {
                return;
            }
        
            validate(value);
            
            self.emit('value-changing');
            self._value = value;
            self.emit('value-changed');
        }    
    }
}