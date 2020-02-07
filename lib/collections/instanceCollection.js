'use strict';

const Instance = require('../instance.js');
const NamedCollection = require('./namedCollection.js');
const Events = require('../events.js');

class InstanceCollection extends NamedCollection {
   constructor(namespace) {
      super();
      this._namespace = namespace;
      this.context.eventRouter.join(this)
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

   _onAdding(items) {
      this._onValidateAdding(items);
      this.emit(Events.instanceCollection.adding, items);
   }
   _onAdded(items) {
      this.emit(Events.instanceCollection.added, items);
   }
   _onRemoving(items) {
      this.emit(Events.instanceCollection.removing, items);
   }
   _onRemoved(items) {
      this.emit(Events.instanceCollection.removed, items);
   }
   _onMoving(items) {
      this.emit(Events.instanceCollection.moving, items);
   }
   _onMoved(items) {
      this.emit(Events.instanceCollection.moved, items);
   }
}

module.exports = InstanceCollection;