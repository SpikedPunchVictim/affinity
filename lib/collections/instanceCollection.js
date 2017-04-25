'use strict';

var Instance = require('../instance.js');
var NamedCollection = require('./namedCollection.js');
var Events = require('../events.js');

class InstanceCollection extends NamedCollection {
   constructor(namespace) {
      super();

      this._namespace = namespace;
   }

   get context() {
      return this._namespace.context;
   }

   get namespace() {
      return this._namespace;
   }

   new(name, model) {
      if (model == null) {
         throw new Error('Invalid model used to create an Instance');
      }

      var instance = new Instance(name, this._namespace, model);
      this._add([{ item: instance, index: this.length }]);
      return instance;
   }

   _emitEvent() {
      var args = [];
      for (var i = 0; i < arguments.length; ++i) {
         args[i] = arguments[i];
      }

      this.context.project.emit.apply(this.context.project, args);
      this.emit.apply(this, args);
   }

   _onAdding(items) {
      this._onValidateAdding(items);
      this._emitEvent(Events.instanceCollection.adding, items);
   }
   _onAdded(items) {
      this._emitEvent(Events.instanceCollection.added, items);
   }
   _onRemoving(items) {
      this._emitEvent(Events.instanceCollection.removing, items);
   }
   _onRemoved(items) {
      this._emitEvent(Events.instanceCollection.removed, items);
   }
   _onMoving(items) {
      this._emitEvent(Events.instanceCollection.moving, items);
   }
   _onMoved(items) {
      this._emitEvent(Events.instanceCollection.moved, items);
   }
}

module.exports = InstanceCollection;