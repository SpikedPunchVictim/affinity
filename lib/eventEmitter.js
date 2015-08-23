var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;

module.exports.mixin = function(dest) {
    _.extend(dest, {
        _emitter: new EventEmitter(),
        _forwards: [],
        addListener: function addListener() {
            this._emitter.addListener.apply(this._emitter, arguments);
        }.bind(dest),
        on: function on(event, listener) {
            this._emitter.on.apply(this._emitter, [event, listener]);
        }.bind(dest),
        once: function once() {
            this._emitter.once.apply(this._emitter, arguments);
        }.bind(dest),
        removeListener: function removeListener() {
            this._emitter.removeListener.apply(this._emitter, arguments);
        }.bind(dest),
        removeAllListeners: function removeAllListeners() {
            this._emitter.removeAllListeners.apply(this._emitter, arguments);
        }.bind(dest),
        setMaxListeners: function setMaxListeners() {
            this._emitter.setMaxListeners.apply(this._emitter, arguments);
        }.bind(dest),
        listeners: function listeners() {
            this._emitter.listeners.apply(this._emitter, arguments);
        }.bind(dest),
        emit: function emit() {
            this._emitter.emit.apply(this._emitter, arguments);

            _.each(this._forwards, function(it) {
                if(it.fromEvent === arguments[0]) {
                    it.onEmit(this, arguments);
                }
            });


        }.bind(dest),
        forward: function(emitter, event, onEmit) {
            _forwards.push({
                emitter: emitter,
                event: event,
                onEmit: onEmit
            });
        }.bind(dest)
    });
}

module.exports.forwarding = function forwarding(source, dest, mapping) {

    this.members.forward(this, 'value-changing', 'member-changing', function(arguments) {

    });

}