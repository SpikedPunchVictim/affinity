'use strict';

const { EventRouter } = require('./eventEmitter.js');
const { EventEmitter } = require('./eventEmitter')
const Undo = require('undo.js');
const Namespace = require('./namespace.js');
const Events = require('./events.js');
const Rfc = require('./requestForChange.js');
const Search = require('./search.js');

class Util {
   static * iterateFamily(parent, getSibling, getItems) {
      var children = getItems(parent);

      if (!children) {
         return;
      }

      for (let child of children) {
         yield child;
      }

      //yield* children;

      for (let sibling of getSibling(parent)) {
         yield* this.iterateFamily(sibling, getSibling, getItems);
      }

      return;
   }
}

class Project extends EventEmitter{
   constructor() {
      super()

      this.eventRouter = new EventRouter()

      this.eventRouter.on('beforeEmit', ({ event, source, values }) => {
         this.emit(event, { source, values })
      })

      this._undoStack = new Undo.Stack();

      this._context = {
         project: this,
         eventRouter: this.eventRouter
      };

      this._root = new Namespace('', null, this._context);
      this._search = new Search(this);
   }

   dispose() {

   }

   get root() {
      return this._root;
   }

   get namespaces() {
      return Util.iterateFamily(this.root, nspace => nspace.children, nspace => nspace.children);
   }

   get models() {
      return Util.iterateFamily(this.root, nspace => nspace.children, nspace => nspace.models);
   }

   get instances() {
      return Util.iterateFamily(this.root, nspace => nspace.children, nspace => nspace.instances);
   }

   get search() {
      return this._search;
   }

   open() {
      return Rfc.new({ project: this })
         .notify(req => {
            this.emit(Events.project.openRequest, req);
            this.emit(Events.requestForChange, req);
         })
         .queue();
   }

   // Commits the project's changes
   commit() {
      let self = this;
      return Rfc.new({ project: this })
         .notify(req => {
            self.emit(Events.project.commitRequest, req);
            self.emit(Events.requestForChange, req);
         })
         .fulfill(req => true)
         .queue();
   }

   _onRequestForchange(req) {
      this.emit(Events.requestForChange, req);
   }
}

function create() {
   return new Project();
}

function open() {
   // ...
}

module.exports = {
   create: function () {
      return new Project();
   },
   open: function () {
      //...
   }
}