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

var EventEmitter = require('./eventEmitter.js');
var NamedObject = require('./namedObject.js');
var Commands = require('./commands.js');
var Events = require('./events.js');
var types = require('./types');

//------------------------------------------------------------------------

var Member = function (_NamedObject) {
    (0, _inherits3.default)(Member, _NamedObject);

    function Member(model, name, value) {
        (0, _classCallCheck3.default)(this, Member);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Member.__proto__ || Object.getPrototypeOf(Member)).call(this, name));

        EventEmitter.mixin(_this);
        _this._model = model;

        // Setup value
        _this._value = value;
        _this._value.on(Events.requestForChange, _this._requestForChange.bind(_this));
        _this._value.on(Events.valueChanging, _this._onValueChanging.bind(_this));
        _this._value.on(Events.valueChanged, _this._onValueChanged.bind(_this));
        return _this;
    }

    (0, _createClass3.default)(Member, [{
        key: 'dispose',
        value: function dispose() {
            this._value.off(Events.requestForChange, this._requestForChange);
            this._value.off(Events.valuechanging, this._onValueChanging);
            this._value.off(Events.valueChanged, this._onValueChanged);
            this._model = null;
        }
    }, {
        key: '_requestForChange',
        value: function _requestForChange(request) {
            request.context.member = this;
            this.context.project._onRequestForchange(request);
        }
    }, {
        key: '_onValueChanging',
        value: function _onValueChanging(change) {
            this.context.project.emit(Events.member.valueChanging, change);
            this.emit(Events.member.valueChanging, change);
        }
    }, {
        key: '_onValueChanged',
        value: function _onValueChanged(change) {
            this.context.project.emit(Events.member.valueChanged, change);
            this.emit(Events.member.valueChanged, change);
        }
    }, {
        key: '_onNameChanging',
        value: function _onNameChanging(change) {
            (0, _get3.default)(Member.prototype.__proto__ || Object.getPrototypeOf(Member.prototype), '_onNameChanging', this).call(this, change);
            this.emit(Events.member.nameChanging, change);
        }
    }, {
        key: '_onNameChanged',
        value: function _onNameChanged(change) {
            (0, _get3.default)(Member.prototype.__proto__ || Object.getPrototypeOf(Member.prototype), '_onNameChanged', this).call(this, change);
            this.emit(Events.member.nameChanged, change);
        }
    }, {
        key: 'model',
        get: function get() {
            return this._model;
        }
    }, {
        key: 'context',
        get: function get() {
            return this._model.context;
        }
    }, {
        key: 'type',
        get: function get() {
            return this._value.type;
        }
    }, {
        key: 'value',
        get: function get() {
            return this._value;
        },
        set: function set(val) {
            if (this._value.equals(val)) {
                return;
            }

            var change = {
                from: this._value,
                to: val
            };

            // Note: changing types isn't supported at this time
            if (types.isValue(val)) {
                if (types.isType(val.type) && !this._value.type.equals(val)) {
                    throw new Error('Changing types is currently unsupported');
                }

                this._value.update(val);
            } else {
                this._value.update(val);
            }
        }
    }]);
    return Member;
}(NamedObject);

module.exports = Member;