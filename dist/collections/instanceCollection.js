'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Instance = require('../instance.js');
var NamedCollection = require('./namedCollection.js');
var Events = require('../events.js');

var InstanceCollection = function (_NamedCollection) {
   (0, _inherits3.default)(InstanceCollection, _NamedCollection);

   function InstanceCollection(namespace) {
      (0, _classCallCheck3.default)(this, InstanceCollection);

      var _this = (0, _possibleConstructorReturn3.default)(this, (InstanceCollection.__proto__ || Object.getPrototypeOf(InstanceCollection)).call(this));

      _this._namespace = namespace;
      return _this;
   }

   (0, _createClass3.default)(InstanceCollection, [{
      key: 'new',
      value: function _new(name, model) {
         if (model == null) {
            throw new Error('Invalid model used to create an Instance');
         }

         var instance = new Instance(name, this._namespace, model);
         this._add([{ item: instance, index: this.length }]);
         return instance;
      }
   }, {
      key: '_emitEvent',
      value: function _emitEvent() {
         var args = [];
         for (var i = 0; i < arguments.length; ++i) {
            args[i] = arguments[i];
         }

         this.context.project.emit.apply(this.context.project, args);
         this.emit.apply(this, args);
      }
   }, {
      key: '_onAdding',
      value: function _onAdding(items) {
         this._onValidateAdding(items);
         this._emitEvent(Events.instanceCollection.adding, items);
      }
   }, {
      key: '_onAdded',
      value: function _onAdded(items) {
         this._emitEvent(Events.instanceCollection.added, items);
      }
   }, {
      key: '_onRemoving',
      value: function _onRemoving(items) {
         this._emitEvent(Events.instanceCollection.removing, items);
      }
   }, {
      key: '_onRemoved',
      value: function _onRemoved(items) {
         this._emitEvent(Events.instanceCollection.removed, items);
      }
   }, {
      key: '_onMoving',
      value: function _onMoving(items) {
         this._emitEvent(Events.instanceCollection.moving, items);
      }
   }, {
      key: '_onMoved',
      value: function _onMoved(items) {
         this._emitEvent(Events.instanceCollection.moved, items);
      }
   }, {
      key: 'context',
      get: function get() {
         return this._namespace.context;
      }
   }, {
      key: 'namespace',
      get: function get() {
         return this._namespace;
      }
   }]);
   return InstanceCollection;
}(NamedCollection);

module.exports = InstanceCollection;