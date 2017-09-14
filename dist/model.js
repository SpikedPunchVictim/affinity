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

var _ = require('lodash');
var MemberCollection = require('./collections/memberCollection.js');
var QualifiedObject = require('./qualifiedObject.js');
var Events = require('./events.js');

var Model = function (_QualifiedObject) {
    (0, _inherits3.default)(Model, _QualifiedObject);

    function Model(name, namespace) {
        (0, _classCallCheck3.default)(this, Model);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Model.__proto__ || Object.getPrototypeOf(Model)).call(this, name, namespace));

        _this._members = new MemberCollection(_this);

        // Forward events
        var self = _this;
        _this._sub = _this._members.sub([{ event: Events.memberCollection.adding, handler: function handler(items) {
                return self._emitEvent(Events.model.memberAdding, items);
            } }, { event: Events.memberCollection.added, handler: function handler(items) {
                return self._emitEvent(Events.model.memberAdded, items);
            } }, { event: Events.memberCollection.moving, handler: function handler(items) {
                return self._emitEvent(Events.model.memberMoving, items);
            } }, { event: Events.memberCollection.moved, handler: function handler(items) {
                return self._emitEvent(Events.model.memberMoved, items);
            } }, { event: Events.memberCollection.removing, handler: function handler(items) {
                return self._emitEvent(Events.model.memberRemoving, items);
            } }, { event: Events.memberCollection.removed, handler: function handler(items) {
                return self._emitEvent(Events.model.memberRemoved, items);
            } }]);

        _this._subItems = _this._members.subItems([{ event: Events.member.valueChanging, handler: function handler(items) {
                return self._emitEvent(Events.model.valueChanging, items);
            } }, { event: Events.member.valueChanged, handler: function handler(items) {
                return self._emitEvent(Events.model.valueChanged, items);
            } }]);
        return _this;
    }

    (0, _createClass3.default)(Model, [{
        key: 'dispose',
        value: function dispose() {
            this._emitEvent(Events.disposing, { source: this });
            this._sub.off();
            this._sub = null;

            this._subItems.off();
            this._subItems = null;
            this._emitEvent(Events.disposed, { source: this });
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
        key: 'context',
        get: function get() {
            return this.parent.context;
        }
    }, {
        key: 'members',
        get: function get() {
            return this._members;
        }
    }]);
    return Model;
}(QualifiedObject);

module.exports = Model;