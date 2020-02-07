'use strict';

const NamedCollection = require('./namedCollection.js');
const Model = require('../model.js');
const Events = require('../events.js');

class ModelCollection extends NamedCollection {
   constructor(namespace) {
      super();
      this._namespace = namespace;
      this.context.eventRouter.join(this)
   }

   get namespace() {
      return this._namespace;
   }

   get context() {
      return this.namespace.context;
   }

   new(name) {
      var model = new Model(name, this._namespace);
      this._add([{ item: model, index: this.length }]);
      return model;
   }

   _onAdding(items) {
      this._onValidateAdding(items);
      this.emit(Events.modelCollection.adding, items);
   }
   _onAdded(items) {
      this.emit(Events.modelCollection.added, items);
   }
   _onRemoving(items) {
      this.emit(Events.modelCollection.removing, items);
   }
   _onRemoved(items) {
      this.emit(Events.modelCollection.removed, items);
   }
   _onMoving(items) {
      this.emit(Events.modelCollection.moving, items);
   }
   _onMoved(items) {
      this.emit(Events.modelCollection.moved, items);
   }
   _onValidateAdding(items) {
      // Blank
   }
}

module.exports = ModelCollection;