'use strict'

/**
 * Exposes a set of utility methods to use by outside code
 * 
 */

const Field = require('./field.js');
const Instance = require('./instance.js');
const Member = require('./member.js');
const Model = require('./model.js');
const NamedObject = require('./namedObject.js');
const Namespace = require('./namespace.js');
const ObservableCollection = require('./collections/observableCollection.js');
const QualifiedObject = require('./qualifiedObject.js');

function isField(obj) {
   return obj instanceof Field
}

function isInstance(obj) {
   return obj instanceof Instance
}

function isMember(obj) {
   return obj instanceof Member
}

function isModel(obj) {
   return obj instanceof Model
}

function isNamedObject(obj) {
   return obj instanceof NamedObject
}

function isNamespace(obj) {
   return obj instanceof Namespace
}

function isObservableCollection(obj) {
   return obj instanceof ObservableCollection
}

function isQualifiedObject(obj) {
   return obj instanceof QualifiedObject
}

/**
 * Utility methods for working with qualified paths
 */
class QPath {
   constructor() {

   }

   /*
   * Retrieves the base name from a qualified path.
   * Example:
   *  'one.two.three' -- returns --> 'three'
   * 
   * @param {string} qualifiedPath The qualified path
   * @returns {string} The last entry in the qualified path 
   */
   static basename(qualifiedPath) {
      if(qualifiedPath == null) {
         throw new Error('qualifiedPath must be valid');
      }

      let tokens = qualifiedPath.split('.');
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
   static parent(qualifiedPath) {
      if(qualifiedPath == null) {
         throw new Error('qualifiedPath must be valid');
      }
      
      let tokens = qualifiedPath.split('.');

      if(tokens.length == 1 && tokens[0] === '') {
         return null;
      }

      switch(tokens.length) {
         case(0): { return null; }
         case(1): { return ''; }
         default: { return tokens.slice(0, tokens.length - 1).join('.'); }
      }
   }
}

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
}