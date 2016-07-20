'use strict';

var qpath = require('./qpath.js');

/*
* Centralized qualified object searching logic.
* Searches all Namespaces up to the last qualified entry.
*
* @param {string} qualifiedPath The qualified path
* @param {function(namespace)} getObjCollection Function to retrieve the named collection from a Namespace
*/
function qualifiedObjectSearch(project, qualifiedName, getObjCollection) {
   if (qualifiedName === '' || qualifiedName.length == 0) {
      return project.root;
   }

   let tokens = qualifiedName.split('.');

   var current = project.root;
   for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];

      if (i == Math.max(0, (tokens.length - 1))) {
         return getObjCollection(current).findByName(token);
      }

      current = current.children.findByName(token);

      if (current == null) {
         return null;
      }
   }

}

//------------------------------------------------------------------------
// Class implements searching for Namespaces
//------------------------------------------------------------------------
class NamespaceSearch {
   constructor(project) {
      this._project = project;
   }

   get project() {
      return this._project;
   }

   /*
   * Finds a Namespace at the specified location
   * 
   * @param {string} qualifiedName The Namespace's qualified name
   */
   find(qualifiedName) {
      return qualifiedObjectSearch(this._project, qualifiedName, nspace => nspace.children);
   }
}

//------------------------------------------------------------------------
// Class implements searching for Namespaces
//------------------------------------------------------------------------
class ModelSearch {
   constructor(project) {
      this._project = project;
   }

   get project() {
      return this._project;
   }

   /*
   * Finds a Model at the specified location
   * 
   * @param {string} qualifiedName The Namespace's qualified name
   */
   find(qualifiedName) {
      return qualifiedObjectSearch(this._project, qualifiedName, nspace => nspace.models);
   }
}

//------------------------------------------------------------------------
// Class implements searching for Namespaces
//------------------------------------------------------------------------
class InstanceSearch {
   constructor(project) {
      this._project = project;
   }

   get project() {
      return this._project;
   }

   /*
   * Finds a Model at the specified location
   * 
   * @param {string} qualifiedName The Namespace's qualified name
   */
   find(qualifiedName) {
      return qualifiedObjectSearch(this._project, qualifiedName, nspace => nspace.instances);
   }
}

//------------------------------------------------------------------------
//
//------------------------------------------------------------------------
class Search {
   constructor(project) {
      this._project = project;
      this._namespaceSearch = new NamespaceSearch(this._project);
      this._modelSearch = new ModelSearch(this._project);
      this._instanceSearch = new InstanceSearch(this._project);
   }

   get project() {
      return this._project;
   }

   get namespace() {
      return this._namespaceSearch;
   }

   get model() {
      return this._modelSearch;
   }

   get instance() {
      return this._instanceSearch;
   }

   // The user can provide a fully qualified name, or a
   // partial qualified name respected from this namespace
   find(qualifiedName) {

   }

   findNamespace(qualifiedName) {
      var found = Namespace.findRelative(this, qualifiedName);
      return found ? found : Namespace.findRelative(this.root, qualifiedName);
   }

   // Provided a starting namespace, will search for the relative
   // ancestor from a qualifiedName
   findRelative(startNamespace, qualifiedName) {
      // current is the root at this point
      var tokens = qualifiedName.split('.');

      if (tokens.length == 1 && tokens[0] === startNamespace.name) {
         return startNamespace;
      }

      var current = startNamespace;
      for (var i = 0; i < tokens.length; i++) {
         var token = tokens[i];
         current = current.children.findByName(token);

         if (current == null) {
            return null;
         }
      }

      return current;
   }
}

module.exports = Search;