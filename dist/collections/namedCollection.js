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

var util = require('util');
var ObservableCollection = require('./observableCollection.js');
var _ = require('lodash');

//
//  This collection represents a collections of Named items
//  (items with a 'name' property)

var NamedCollection = function (_ObservableCollection) {
    (0, _inherits3.default)(NamedCollection, _ObservableCollection);

    function NamedCollection() {
        (0, _classCallCheck3.default)(this, NamedCollection);
        return (0, _possibleConstructorReturn3.default)(this, (NamedCollection.__proto__ || Object.getPrototypeOf(NamedCollection)).call(this));
    }

    (0, _createClass3.default)(NamedCollection, [{
        key: 'at',
        value: function at(index) {
            return this._items[index];
        }
    }, {
        key: 'get',
        value: function get(name) {
            return this.findByName(name);
        }
    }, {
        key: 'findByName',
        value: function findByName(name) {
            if (!_.isString(name)) {
                throw new Error(util.format('Invalid name type passed to findByName()'));
                //return this.emit('error', util.format('Invalid name type passed to findByName()'));
            }

            for (var i = 0; i < this._items.length; ++i) {
                var item = this._items[i];
                if (item.name === name) {
                    return item;
                }
            }

            return null;
        }
    }, {
        key: 'indexByName',
        value: function indexByName(name) {
            if (!_.isString(name)) {
                return this.emit('error', 'indexByName expects a string argument');
            }

            for (var i = 0; i < this.length; ++i) {
                var current = this._items[i];
                if (current.name === name) {
                    return i;
                }
            }
        }
    }, {
        key: '_onValidateItem',
        value: function _onValidateItem(item) {
            try {
                var name = item.name;
            } catch (e) {
                this.emit('error', 'Cannot add item without a valid name property to a NamedCollection');
            }
        }
    }, {
        key: 'length',
        get: function get() {
            return this._items.length;
        }
    }]);
    return NamedCollection;
}(ObservableCollection);

module.exports = NamedCollection;