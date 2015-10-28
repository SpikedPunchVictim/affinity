var assert = require('assert');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('lodash');

// module.exports.mixin = function mixin(dest, source) {
//   if (dest && source) {
//     for (var key in source) {
//       dest[key] = source[key];
//     }
//   }
//   return dest;
// }

// Forwards events from one EventEmitter to another.
// This assumes both source and destination are EventEmitters
module.exports.forward = function forward(source, dest) {
    var emit = source.emit;
    source.emit = function(type) {
    if ('error' != type)
        emit.apply(source, arguments);
    return dest.emit.apply(dest, arguments);
  };
}

// Extends an object
module.exports.extend = function extend(dest, source) {
    if(dest) {
        var names = Object.getOwnPropertyNames(source);
        for(var i = 0; i < names.length; ++i) {
            var prop = names[i];
            var desc = Object.getOwnPropertyDescriptor(source, prop);
            Object.defineProperty(dest, prop, desc);
        }
    }
}

module.exports.events = {
    //--------------------------------------------------------------------
    // Forwards events from one EventEmitter to another.
    //
    // options : Object
    //  - source: EventEmitter
    //      The source of the events
    //
    //  - dest : EventEmitter
    //      The destination of the raised events
    //
    //  - events : Array
    //      The list of events to forward from the source to the destination
    //
    //--------------------------------------------------------------------
    forward: function forward(options) {
                return {
                    subscribe: function() {
                        var self = this;
                        this._events.forEach(function(ev) {
                            var fwd = _.bind(_.partial(self._forward, ev), self);
                            self._listeners[ev] = fwd;
                            self._source.on(ev, fwd);
                        });
                    },
                    unsubscribe: function() {
                        for(var key in this._listeners) {
                            this._source.removeListener(key, this._listeners[key]);
                        }
                    },
                    _source: options.source,
                    _dest: options.dest,
                    _events: options.events,
                    _listeners: {},
                    _forward: function forward() {
                        this._dest.emit.apply(this._dest, arguments);
                    }
                }
            }
}

module.exports.validateEvent = function validateEvent(emitter, event, triggerEvent, callback) {
    var timer = setTimeout(function() {
        assert(false, util.format('Event Expected: %s', event));
        callback();
    }, 1000);

    emitter.once(event, function() {
        clearTimeout(timer);
        assert(true);
        callback();
    });

    triggerEvent();
}
