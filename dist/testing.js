'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _types = require('./types');
var _ = require('lodash');

function getRandomString() {
   var result = "";
   _.times(_.random(3, 10), function () {
      var isUpper = _.random(0, 128) % 2 == 0;
      var code = isUpper ? _.random(65, 90) : _.random(97, 122);
      result = '' + result + String.fromCharCode(code);
   });

   return result;
}

var Fill = function () {
   function Fill() {
      (0, _classCallCheck3.default)(this, Fill);
   }

   (0, _createClass3.default)(Fill, null, [{
      key: 'values',

      /*
      * Returns an array of all known values set to their default
      * value.
      */
      value: function values() {
         var result = [];
         var primitives = [_types.bool.value(), _types.decimal.value(), _types.string.value(), _types.int.value(), _types.uint.value()];

         result = result.concat(primitives);

         primitives.forEach(function (val) {
            result.push(_types.collection.value(val.type));
         });

         return result;
      }

      /*
      * Returns an aray of all possible tyes
      */

   }, {
      key: 'types',
      value: function types() {
         var result = [];
         var primitives = [_types.bool.type(), _types.decimal.type(), _types.string.type(), _types.int.type(), _types.uint.type()];

         result = result.concat(primitives);
         var collectionTypes = result.map(function (type) {
            return _types.collection.type(type);
         });
         result = result.concat(collectionTypes);

         // Nested Collection Types (ie collection<collection<string>>)
         result = result.concat(collectionTypes.map(function (type) {
            return _types.collection.type(type);
         }));

         return result;
      }
   }, {
      key: 'randomValues',
      value: function randomValues() {
         var result = [];
         var primitives = [_types.bool.value(_.random(1, 2) % 2 == 0), _types.decimal.value(_.random(0, 10000, true)), _types.string.value(getRandomString()), _types.int.value(_.random(-10000, 1000000)), _types.uint.value(_.random(0, 1000000))];

         result = result.concat(primitives);

         primitives.forEach(function (val) {
            var collection = _types.collection.value(val.type);
            result.push(_types.collection.value(val.type));
         });

         return result;
      }

      /*
      * Fills a model with members of every value type
      * 
      * @params {Model} mod The model to fill
      * @return {Object} An Object containing information on how the model was populated:
      *                 name {string} Member name
      *                 index {Number} The index of the member
      *                 value {Value} The value the member has been populated with
      */

   }, {
      key: 'model',
      value: function model(mod) {
         var result = [];
         var index = 0;

         Fill.values().forEach(function (val) {
            var info = { name: 'member_' + index, index: index++, value: val };
            mod.members.new(info.name, val);
            result.push(info);
         });

         return result;
      }
   }, {
      key: 'namespace',
      value: function namespace(nspace, depth) {
         if (depth == null) {
            depth = 3;
         }

         var models = _.times(_.random(3, 12), function () {
            return nspace.models.new(getRandomString());
         });

         models.forEach(function (m) {
            return Fill.model(m);
         });

         var instances = _.times(_.random(2, 28), function () {
            return nspace.instances.new(getRandomString(), _.sample(models));
         });

         var nspaces = _.times(_.random(1, 5), function () {
            return nspace.children.new(getRandomString());
         });

         if (depth > 0) {
            nspaces.forEach(function (n) {
               return Fill.namespace(n, depth - 1);
            });
         }
      }
   }, {
      key: 'project',
      value: function project(proj, depth) {
         depth = depth || 3;
         Fill.namespace(proj.root, depth);
      }
   }]);
   return Fill;
}();

module.exports = {
   fill: Fill
};