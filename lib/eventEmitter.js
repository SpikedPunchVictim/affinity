var _ = require('lodash');
var Emitter = require('event-emitter');
Emitter.pipe = require('event-emitter/pipe')
var hasListeners = require('event-emitter/has-listeners')

module.exports.mixin = function mixin(dest) {
    if('emit' in dest) {
        return;
    } else {
        Emitter(dest);
        dest.hasListeners = function(event) {
            return hasListeners(dest, event);
        }
    }
}

module.exports.hasListeners = function hasListeners(source, event) {
    
}

module.exports.chain = function chain(src, dest) {
    return Emitter.pipe(src, dest);
}

exports.sub = function(source, subs) {
    subs.forEach(item => {
        source.on(item.event, item.handler); 
    });
    
    return {
        off: function off() {
            subs.forEach(item => {
                source.off(item.event, item.handler); 
            });
        }
    }
}



//var EventEmitter = require('events').EventEmitter;

// module.exports.mixin = function(dest) {
//     _.extend(dest, {
//         _emitter: new EventEmitter(),
//         _forwards: [],
//         addListener: function addListener() {
//             this._emitter.addListener.apply(this._emitter, arguments);
//         }.bind(dest),
//         on: function on(event, listener) {
//             this._emitter.on.apply(this._emitter, [event, listener]);
//         }.bind(dest),
//         once: function once() {
//             this._emitter.once.apply(this._emitter, arguments);
//         }.bind(dest),
//         removeListener: function removeListener() {
//             this._emitter.removeListener.apply(this._emitter, arguments);
//         }.bind(dest),
//         removeAllListeners: function removeAllListeners() {
//             this._emitter.removeAllListeners.apply(this._emitter, arguments);
//         }.bind(dest),
//         setMaxListeners: function setMaxListeners() {
//             this._emitter.setMaxListeners.apply(this._emitter, arguments);
//         }.bind(dest),
//         listeners: function listeners() {
//             this._emitter.listeners.apply(this._emitter, arguments);
//         }.bind(dest),
//         emit: function emit() {
//             this._emitter.emit.apply(this._emitter, arguments);

//             _.each(this._forwards, function(it) {
//                 if(it.event === arguments[0]) {
//                     it.onEmit(this, arguments);
//                 }
//             });

//         }.bind(dest),
//         forward: function(emitter, event, xform) {
//             this._forwards.push({
//                 emitter: emitter,
//                 event: event,
//                 xform: xform || function(x) { return x; }
//             });

//         }.bind(dest),
//         forward_unbind: function forward_unbind(emitter) {
//             _.remove(this._forwards, function(item) {
//                 return item.emitter === emitter;
//             });
//         }.bind(dest)
//     });
// }