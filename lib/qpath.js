'use strict';

/*
* Utilities for qualified paths
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

module.exports = QPath;