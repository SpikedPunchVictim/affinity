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
var Emitter = require('../eventEmitter');
var NamedCollection = require('./namedCollection.js');
var Field = require('../field.js');
var Events = require('../events.js');

var FieldCollection = function (_NamedCollection) {
    (0, _inherits3.default)(FieldCollection, _NamedCollection);

    function FieldCollection(instance) {
        (0, _classCallCheck3.default)(this, FieldCollection);

        var _this = (0, _possibleConstructorReturn3.default)(this, (FieldCollection.__proto__ || Object.getPrototypeOf(FieldCollection)).call(this));

        _this._instance = instance;
        return _this;
    }

    (0, _createClass3.default)(FieldCollection, [{
        key: 'new',
        value: function _new(member, index) {
            var field = new Field(this._instance, member);
            index = index ? index : this.length;
            this.insert(index, field);
            return field;
        }

        // Returns the Field with the specified name

    }, {
        key: 'get',
        value: function get(name) {
            return this.find(function (field) {
                return field.name.toLowerCase() === name.toLowerCase();
            });
        }
    }, {
        key: '_onAdding',
        value: function _onAdding(items) {
            (0, _get3.default)(FieldCollection.prototype.__proto__ || Object.getPrototypeOf(FieldCollection.prototype), '_onAdding', this).call(this, items);
            this.emit(Events.fieldCollection.adding, items);
        }
    }, {
        key: '_onAdded',
        value: function _onAdded(items) {
            (0, _get3.default)(FieldCollection.prototype.__proto__ || Object.getPrototypeOf(FieldCollection.prototype), '_onAdded', this).call(this, items);
            this.emit(Events.fieldCollection.added, items);
        }
    }, {
        key: '_onRemoving',
        value: function _onRemoving(items) {
            (0, _get3.default)(FieldCollection.prototype.__proto__ || Object.getPrototypeOf(FieldCollection.prototype), '_onRemoving', this).call(this, items);
            this.emit(Events.fieldCollection.removing, items);
        }
    }, {
        key: '_onRemoved',
        value: function _onRemoved(items) {
            (0, _get3.default)(FieldCollection.prototype.__proto__ || Object.getPrototypeOf(FieldCollection.prototype), '_onRemoved', this).call(this, items);
            this.emit(Events.fieldCollection.removed, items);
        }
    }, {
        key: '_onMoving',
        value: function _onMoving(items) {
            (0, _get3.default)(FieldCollection.prototype.__proto__ || Object.getPrototypeOf(FieldCollection.prototype), '_onMoving', this).call(this, items);
            this.emit(Events.fieldCollection.moving, items);
        }
    }, {
        key: '_onMoved',
        value: function _onMoved(items) {
            (0, _get3.default)(FieldCollection.prototype.__proto__ || Object.getPrototypeOf(FieldCollection.prototype), '_onMoved', this).call(this, items);
            this.emit(Events.fieldCollection.moved, items);
        }
    }, {
        key: '_onValidateAdding',
        value: function _onValidateAdding(items) {
            // Each item is expected to be a field

            // Validate unique name
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = items[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var it = _step.value;

                    if (!(it.item instanceof Field)) {
                        throw new Error(util.format('Duplicate field name encountere when adding new field: %s', it.item.name));
                    }
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
        }
    }, {
        key: 'instance',
        get: function get() {
            return this._instance;
        }
    }, {
        key: 'model',
        get: function get() {
            return this._instance.model;
        }
    }, {
        key: 'context',
        get: function get() {
            return this._instance.context;
        }
    }]);
    return FieldCollection;
}(NamedCollection);

module.exports = FieldCollection;

/*
function InstanceMemberCollection(instance, model) {
    Emitter.mixin(this);
    CommonCollection.mixin(this);

    this.instance = instance;
    this.model = model;

    Object.defineProperty(this, 'context', {
        get: function() {
            return this.instance.context;
        }
    });

    this._onItemsAdding = function(items) {
        this.context.project.emit(InstanceMemberCollection.events.adding, items);
        this.emit(InstanceMemberCollection.events.adding, items)
    }

    this._onItemsAdded= function(items) {
        this.context.project.emit(InstanceMemberCollection.events.added, items);
        this.emit(InstanceMemberCollection.events.added, items)
    }
    
    this._onItemsRemoving = function(items) {
        this.context.project.emit(InstanceMemberCollection.events.removing, items);
        this.emit(InstanceMemberCollection.events.removing, items)
    }
    
    this._onItemsRemoved = function(items) {
        this.context.project.emit(InstanceMemberCollection.events.removed, items);
        this.emit(InstanceMemberCollection.events.removed, items)
    }
}

//------------------------------------------------------------------------
// List of supported events
InstanceMemberCollection.events = {
    adding: 'instance-member-adding',
    added: 'instance-member-added',
    removing: 'instance-member-removing',
    removed: 'instance-member-removed',   
}

//------------------------------------------------------------------------
InstanceMemberCollection.prototype.add = function add(name, type, value) {
    this.insert(name, type, value, this._items.length);
}

//------------------------------------------------------------------------
InstanceMemberCollection.prototype.insert = function insert(name, type, value, index) {
    var member = this.model.members.get(name);
    var instanceMember = new InstanceMember(this.instance, member);

    var items = [{item: instanceMember, index: this._items.length}];

    this._onAdding(items);
    this._items.insert(instanceMember, index);
    this._onAdded(items);
    return instanceMember;
}

//------------------------------------------------------------------------
// Sets the value of the Field with the specified name. Returns
// the field if it exists, otherwise returns undefined.
//------------------------------------------------------------------------
InstanceMemberCollection.prototype.set = function set(name, value) {
    var found = this.get(name);

    if(found) {
        found.value = value;
    }

    return found;
}

//------------------------------------------------------------------------
InstanceMemberCollection.prototype.get = function get(name) {
    var found = this._items.find(function(item) {
        return item.name === name;
    });

    return found;
}
*/