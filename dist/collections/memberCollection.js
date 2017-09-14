'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var util = require('util');
var NamedCollection = require('./namedCollection.js');
var Member = require('../member.js');
var Events = require('../events.js');

var MemberCollection = function (_NamedCollection) {
    (0, _inherits3.default)(MemberCollection, _NamedCollection);

    function MemberCollection(model) {
        (0, _classCallCheck3.default)(this, MemberCollection);

        var _this = (0, _possibleConstructorReturn3.default)(this, (MemberCollection.__proto__ || Object.getPrototypeOf(MemberCollection)).call(this));

        _this.model = model;

        var self = _this;
        _this._subs = _this.subItems([{ event: Events.member.valueChanging, handler: function handler(change) {
                return self.emit(Events.memberCollection.valueChanging, change);
            } }, { event: Events.member.valueChanged, handler: function handler(change) {
                return self.emit(Events.memberCollection.valueChanged, change);
            } }]);
        return _this;
    }

    (0, _createClass3.default)(MemberCollection, [{
        key: 'new',
        value: function _new(name, value) {
            if (!value) {
                throw new Error('Invalid value used for member creation.');
            }

            var member = new Member(this.model, name, value);
            this._add([{ item: member, index: this.length }]);
            return member;
        }
    }, {
        key: '_onAdding',
        value: function _onAdding(items) {
            (0, _get3.default)(MemberCollection.prototype.__proto__ || Object.getPrototypeOf(MemberCollection.prototype), '_onAdding', this).call(this, items);
            //this._onValidateAdding(items);
            this.emit(Events.memberCollection.adding, items);
        }
    }, {
        key: '_onAdded',
        value: function _onAdded(items) {
            (0, _get3.default)(MemberCollection.prototype.__proto__ || Object.getPrototypeOf(MemberCollection.prototype), '_onAdded', this).call(this, items);
            this.emit(Events.memberCollection.added, items);
        }
    }, {
        key: '_onRemoving',
        value: function _onRemoving(items) {
            (0, _get3.default)(MemberCollection.prototype.__proto__ || Object.getPrototypeOf(MemberCollection.prototype), '_onRemoving', this).call(this, items);
            this.emit(Events.memberCollection.removing, items);
        }
    }, {
        key: '_onRemoved',
        value: function _onRemoved(items) {
            (0, _get3.default)(MemberCollection.prototype.__proto__ || Object.getPrototypeOf(MemberCollection.prototype), '_onRemoved', this).call(this, items);
            this.emit(Events.memberCollection.removed, items);
        }
    }, {
        key: '_onMoving',
        value: function _onMoving(items) {
            (0, _get3.default)(MemberCollection.prototype.__proto__ || Object.getPrototypeOf(MemberCollection.prototype), '_onMoving', this).call(this, items);
            this.emit(Events.memberCollection.moving, items);
        }
    }, {
        key: '_onMoved',
        value: function _onMoved(items) {
            (0, _get3.default)(MemberCollection.prototype.__proto__ || Object.getPrototypeOf(MemberCollection.prototype), '_onMoved', this).call(this, items);
            this.emit(Events.memberCollection.moved, items);
        }
    }, {
        key: '_onValidateAdding',
        value: function _onValidateAdding(items) {
            // Validate unique name
            for (var i = 0; i < items.length; ++i) {
                if (this.findByName(items[i].item.name)) {
                    throw new Error('Cannot add members with the same name');
                }
            }
        }
    }, {
        key: 'context',
        get: function get() {
            return this.model.context;
        }
    }]);
    return MemberCollection;
}(NamedCollection);

module.exports = MemberCollection;