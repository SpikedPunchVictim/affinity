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

var MemberCollection = require('./collections/memberCollection.js');
var QualifiedObject = require('./qualifiedObject.js');
var FieldCollection = require('./collections/fieldCollection.js');
var Events = require('./events.js');

var Instance = function (_QualifiedObject) {
    (0, _inherits3.default)(Instance, _QualifiedObject);

    function Instance(name, namespace, model) {
        (0, _classCallCheck3.default)(this, Instance);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Instance.__proto__ || Object.getPrototypeOf(Instance)).call(this, name, namespace));

        _this._model = model;
        _this._fields = new FieldCollection(_this);

        var fieldIndex = 0;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = model.members[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var member = _step.value;

                _this._fields.new(member, fieldIndex++);
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        model.on(Events.model.memberAdded, _this._onMemberAdded.bind(_this));
        model.on(Events.model.memberMoved, _this._onMemberMoved.bind(_this));
        model.on(Events.model.memberRemoved, _this._onMemberRemoved.bind(_this));

        var self = _this;
        _this._subs = _this._fields.sub([{ event: Events.fieldCollection.adding, handler: function handler(items) {
                return self._emitEvent(Events.instance.fieldAdding, items);
            } }, { event: Events.fieldCollection.added, handler: function handler(items) {
                return self._emitEvent(Events.instance.fieldAdded, items);
            } }, { event: Events.fieldCollection.moving, handler: function handler(items) {
                return self._emitEvent(Events.instance.fieldMoving, items);
            } }, { event: Events.fieldCollection.moved, handler: function handler(items) {
                return self._emitEvent(Events.instance.fieldMoved, items);
            } }, { event: Events.fieldCollection.removing, handler: function handler(items) {
                return self._emitEvent(Events.instance.fieldRemoving, items);
            } }, { event: Events.fieldCollection.removed, handler: function handler(items) {
                return self._emitEvent(Events.instance.fieldRemoved, items);
            } }]);

        _this._subItems = _this._fields.subItems([{ event: Events.nameChanged, handler: function handler(items) {
                return self._emitEvent(Events.instance.fieldNameChanged, items);
            } }, { event: Events.field.inheritedChanging, handler: function handler(items) {
                return self._emitEvent(Events.instance.fieldInheritedChanging, items);
            } }, { event: Events.field.inheritedChanged, handler: function handler(items) {
                return self._emitEvent(Events.instance.fieldInheritedChanged, items);
            } }, { event: Events.field.resetStart, handler: function handler(items) {
                return self._emitEvent(Events.instance.fieldResetStart, items);
            } }, { event: Events.field.resetEnd, handler: function handler(items) {
                return self._emitEvent(Events.instance.fieldResetEnd, items);
            } }, { event: Events.field.valueChanging, handler: function handler(items) {
                return self._emitEvent(Events.instance.fieldValueChanging, items);
            } }, { event: Events.field.valueChanged, handler: function handler(items) {
                return self._emitEvent(Events.instance.fieldValueChanged, items);
            } }]);
        return _this;
    }

    (0, _createClass3.default)(Instance, [{
        key: 'dispose',
        value: function dispose() {
            this._emitEvent(Events.disposing, { source: this });
            this._subs.off();
            this._subs = null;
            this._subItems.off();
            this._subItems = null;
            this._model.off(Events.model.memberAdded, this._onMemberAdded);
            this._model.off(Events.model.memberMoved, this._onMemberMoved);
            this._model.off(Events.model.memberRemoved, this._onMemberRemoved);
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

        //------------------------------------------------------------------------

    }, {
        key: '_addField',
        value: function _addField(member, index) {
            this._fields.new(member, index);
        }

        //------------------------------------------------------------------------

    }, {
        key: '_onMemberAdded',
        value: function _onMemberAdded(items) {
            items.sort(function (a, b) {
                if (a.index > b.index) return 1;
                if (a.index < b.index) return -1;
                return 0;
            });

            for (var i = 0; i < items.length; i++) {
                this._addField(items[i].item, items[i].index);
            }
        }

        //------------------------------------------------------------------------

    }, {
        key: '_onMemberRemoved',
        value: function _onMemberRemoved(items) {
            // Sort highest index first (safe for multiple removals)
            items.sort(function (a, b) {
                if (a.index < b.index) return 1;
                if (a.index > b.index) return -1;
                return 0;
            });

            for (var i = 0; i < items.length; i++) {
                this._fields.removeAt(items[i].index);
            }
        }

        //------------------------------------------------------------------------

    }, {
        key: '_onMemberMoved',
        value: function _onMemberMoved(items) {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = items[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var item = _step2.value;

                    this._fields.move(item.from, item.to);
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }
        }
    }, {
        key: 'context',
        get: function get() {
            return this.parent.context;
        }
    }, {
        key: 'model',
        get: function get() {
            return this._model;
        }
    }, {
        key: 'fields',
        get: function get() {
            return this._fields;
        }
    }]);
    return Instance;
}(QualifiedObject);

module.exports = Instance;