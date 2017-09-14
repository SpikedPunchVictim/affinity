'use strict';

/**
 * Exposes a set of utility methods to use by outside code
 * 
 */

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Field = require('./field.js');
var Instance = require('./instance.js');
var Member = require('./member.js');
var Model = require('./model.js');
var NamedObject = require('./namedObject.js');
var Namespace = require('./namespace.js');
var ObservableCollection = require('./collections/observableCollection.js');
var QualifiedObject = require('./qualifiedObject.js');

function isField(obj) {
   return obj instanceof Field;
}

function isInstance(obj) {
   return obj instanceof Instance;
}

function isMember(obj) {
   return obj instanceof Member;
}

function isModel(obj) {
   return obj instanceof Model;
}

function isNamedObject(obj) {
   return obj instanceof NamedObject;
}

function isNamespace(obj) {
   return obj instanceof Namespace;
}

function isObservableCollection(obj) {
   return obj instanceof ObservableCollection;
}

function isQualifiedObject(obj) {
   return obj instanceof QualifiedObject;
}

/**
 * Utility methods for working with qualified paths
 */

var QPath = function () {
   function QPath() {
      (0, _classCallCheck3.default)(this, QPath);
   }

   /*
   * Retrieves the base name from a qualified path.
   * Example:
   *  'one.two.three' -- returns --> 'three'
   * 
   * @param {string} qualifiedPath The qualified path
   * @returns {string} The last entry in the qualified path 
   */


   (0, _createClass3.default)(QPath, null, [{
      key: 'basename',
      value: function basename(qualifiedPath) {
         if (qualifiedPath == null) {
            throw new Error('qualifiedPath must be valid');
         }

         var tokens = qualifiedPath.split('.');
         return tokens.length > 0 ? tokens[tokens.length - 1] : '';
      }

      /*
      * Retrieves the parent name from a qualified path.
      * Example:
      *  'one.two.three' -- returns --> 'one.two'
      * 
      * @param {string} qualifiedPath The qualified path
      * @returns {string} The second to last entry in the qualified path.
      *                   If the root qualified path is provided, null will be returned.
      */

   }, {
      key: 'parent',
      value: function parent(qualifiedPath) {
         if (qualifiedPath == null) {
            throw new Error('qualifiedPath must be valid');
         }

         var tokens = qualifiedPath.split('.');

         if (tokens.length == 1 && tokens[0] === '') {
            return null;
         }

         switch (tokens.length) {
            case 0:
               {
                  return null;
               }
            case 1:
               {
                  return '';
               }
            default:
               {
                  return tokens.slice(0, tokens.length - 1).join('.');
               }
         }
      }
   }]);
   return QPath;
}();

module.exports = {
   isField: isField,
   isInstance: isInstance,
   isMember: isMember,
   isModel: isModel,
   isNamedObject: isNamedObject,
   isNamespace: isNamespace,
   isObservableCollection: isObservableCollection,
   isQualifiedObject: isQualifiedObject,
   qpath: QPath
};