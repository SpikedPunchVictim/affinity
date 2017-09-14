'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var qpath = require('./utils.js').qpath;

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

   var tokens = qualifiedName.split('.');

   var current = project.root;
   for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];

      if (i == Math.max(0, tokens.length - 1)) {
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

var NamespaceSearch = function () {
   function NamespaceSearch(project) {
      (0, _classCallCheck3.default)(this, NamespaceSearch);

      this._project = project;
   }

   (0, _createClass3.default)(NamespaceSearch, [{
      key: 'find',


      /*
      * Finds a Namespace at the specified location
      * 
      * @param {string} qualifiedName The Namespace's qualified name
      */
      value: function find(qualifiedName) {
         return qualifiedObjectSearch(this._project, qualifiedName, function (nspace) {
            return nspace.children;
         });
      }
   }, {
      key: 'project',
      get: function get() {
         return this._project;
      }
   }]);
   return NamespaceSearch;
}();

//------------------------------------------------------------------------
// Class implements searching for Namespaces
//------------------------------------------------------------------------


var ModelSearch = function () {
   function ModelSearch(project) {
      (0, _classCallCheck3.default)(this, ModelSearch);

      this._project = project;
   }

   (0, _createClass3.default)(ModelSearch, [{
      key: 'find',


      /*
      * Finds a Model at the specified location
      * 
      * @param {string} qualifiedName The Namespace's qualified name
      */
      value: function find(qualifiedName) {
         return qualifiedObjectSearch(this._project, qualifiedName, function (nspace) {
            return nspace.models;
         });
      }
   }, {
      key: 'project',
      get: function get() {
         return this._project;
      }
   }]);
   return ModelSearch;
}();

//------------------------------------------------------------------------
// Class implements searching for Namespaces
//------------------------------------------------------------------------


var InstanceSearch = function () {
   function InstanceSearch(project) {
      (0, _classCallCheck3.default)(this, InstanceSearch);

      this._project = project;
   }

   (0, _createClass3.default)(InstanceSearch, [{
      key: 'find',


      /*
      * Finds a Model at the specified location
      * 
      * @param {string} qualifiedName The Namespace's qualified name
      */
      value: function find(qualifiedName) {
         return qualifiedObjectSearch(this._project, qualifiedName, function (nspace) {
            return nspace.instances;
         });
      }
   }, {
      key: 'project',
      get: function get() {
         return this._project;
      }
   }]);
   return InstanceSearch;
}();

//------------------------------------------------------------------------
//
//------------------------------------------------------------------------


var Search = function () {
   function Search(project) {
      (0, _classCallCheck3.default)(this, Search);

      this._project = project;
      this._namespaceSearch = new NamespaceSearch(this._project);
      this._modelSearch = new ModelSearch(this._project);
      this._instanceSearch = new InstanceSearch(this._project);
   }

   (0, _createClass3.default)(Search, [{
      key: 'find',


      // The user can provide a fully qualified name, or a
      // partial qualified name respected from this namespace
      value: function find(qualifiedName) {}
   }, {
      key: 'findNamespace',
      value: function findNamespace(qualifiedName) {
         var found = Namespace.findRelative(this, qualifiedName);
         return found ? found : Namespace.findRelative(this.root, qualifiedName);
      }

      // Provided a starting namespace, will search for the relative
      // ancestor from a qualifiedName

   }, {
      key: 'findRelative',
      value: function findRelative(startNamespace, qualifiedName) {
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
   }, {
      key: 'project',
      get: function get() {
         return this._project;
      }
   }, {
      key: 'namespace',
      get: function get() {
         return this._namespaceSearch;
      }
   }, {
      key: 'model',
      get: function get() {
         return this._modelSearch;
      }
   }, {
      key: 'instance',
      get: function get() {
         return this._instanceSearch;
      }
   }]);
   return Search;
}();

module.exports = Search;