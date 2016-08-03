'use strict';

var Emitter = require('./eventEmitter.js');
var Undo = require('undo.js');
var Namespace = require('./namespace.js');
var Events = require('./events.js');
var Rfc = require('./requestForChange.js');
var Search = require('./search.js');

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
         // for(let grandChild of iterateFamily(child, getChildren)) {
         //     yield grandChild;
         // }
      }

      return;
   }
}

class Project {
   constructor() {
      Emitter.mixin(this);

      this._undoStack = new Undo.Stack();

      this._context = {
         project: this
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