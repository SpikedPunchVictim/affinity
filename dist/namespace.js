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

var QualifiedObject = require('./qualifiedObject.js');
var NamespaceCollection = require('./collections/namespaceCollection.js');
var ModelCollection = require('./collections/modelCollection.js');
var InstanceCollection = require('./collections/instanceCollection.js');
var Events = require('./events.js');

var Namespace = function (_QualifiedObject) {
    (0, _inherits3.default)(Namespace, _QualifiedObject);

    function Namespace(name, parent, context) {
        (0, _classCallCheck3.default)(this, Namespace);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Namespace.__proto__ || Object.getPrototypeOf(Namespace)).call(this, name, parent));

        _this._context = context;

        _this._children = new NamespaceCollection(_this);
        _this._models = new ModelCollection(_this);
        _this._instances = new InstanceCollection(_this);

        // Subscribe/forward events
        var self = _this;
        _this._childrenSub = _this._children.sub([{ event: Events.namespaceCollection.adding, handler: function handler(items) {
                return self._emitEvent(Events.namespace.childAdding, items);
            } }, { event: Events.namespaceCollection.added, handler: function handler(items) {
                return self._emitEvent(Events.namespace.childAdded, items);
            } }, { event: Events.namespaceCollection.moving, handler: function handler(items) {
                return self._emitEvent(Events.namespace.childMoving, items);
            } }, { event: Events.namespaceCollection.moved, handler: function handler(items) {
                return self._emitEvent(Events.namespace.childMoved, items);
            } }, { event: Events.namespaceCollection.removing, handler: function handler(items) {
                return self._emitEvent(Events.namespace.childRemoving, items);
            } }, { event: Events.namespaceCollection.removed, handler: function handler(items) {
                // TODO: Handle namespace item disposing (centrally?)
                self._disposeRemoved(items);
                self._emitEvent(Events.namespace.childRemoved, items);
            }
        }]);

        _this._modelSub = _this._models.sub([{ event: Events.modelCollection.adding, handler: function handler(items) {
                return self._emitEvent(Events.namespace.modelAdding, items);
            } }, { event: Events.modelCollection.added, handler: function handler(items) {
                return self._emitEvent(Events.namespace.modelAdded, items);
            } }, { event: Events.modelCollection.moving, handler: function handler(items) {
                return self._emitEvent(Events.namespace.modelMoving, items);
            } }, { event: Events.modelCollection.moved, handler: function handler(items) {
                return self._emitEvent(Events.namespace.modelMoved, items);
            } }, { event: Events.modelCollection.removing, handler: function handler(items) {
                return self._emitEvent(Events.namespace.modelRemoving, items);
            } }, { event: Events.modelCollection.removed, handler: function handler(items) {
                self._disposeRemoved(items);
                self._emitEvent(Events.namespace.modelRemoved, items);
            }
        }]);

        _this._instancesSub = _this._instances.sub([{ event: Events.instanceCollection.adding, handler: function handler(items) {
                return self._emitEvent(Events.namespace.instanceAdding, items);
            } }, { event: Events.instanceCollection.added, handler: function handler(items) {
                return self._emitEvent(Events.namespace.instanceAdded, items);
            } }, { event: Events.instanceCollection.moving, handler: function handler(items) {
                return self._emitEvent(Events.namespace.instanceMoving, items);
            } }, { event: Events.instanceCollection.moved, handler: function handler(items) {
                return self._emitEvent(Events.namespace.instanceMoved, items);
            } }, { event: Events.instanceCollection.removing, handler: function handler(items) {
                return self._emitEvent(Events.namespace.instanceRemoving, items);
            } }, { event: Events.instanceCollection.removed, handler: function handler(items) {
                self._disposeRemoved(items);
                self._emitEvent(Events.namespace.instanceRemoved, items);
            }
        }]);
        return _this;
    }

    (0, _createClass3.default)(Namespace, [{
        key: 'dispose',
        value: function dispose() {
            this._emitEvent(Events.disposing, { source: this });
            this._childrenSub.off();
            this._modelSub.off();
            this._instancesSub.off();
            this._emitEvent(Events.disposed, { source: this });
        }
    }, {
        key: 'expand',


        /*
        * From the root, will build out the specified qualified
        * path. This will add Namespaces where they don't exist,
        * and ignore the ones that do.
        *
        * @param {string} qualifiedName The qualified name of the resulting Namespace
        * @return {Namespace} Returns the Namespace created (matching the qualified name)
        */
        value: function expand(qualifiedName) {
            var tokens = qualifiedName.split('.');

            var current = this.root;
            tokens.forEach(function (token) {
                current = current.children.getOrAdd(token);
            });
            return current;
        }
    }, {
        key: '_emitEvent',
        value: function _emitEvent() {
            var args = [];
            for (var i = 0; i < arguments.length; ++i) {
                args[i] = arguments[i];
            }

            this.context.project.emit.apply(this, args);
            this.emit.apply(this, args);
        }
    }, {
        key: '_disposeRemoved',
        value: function _disposeRemoved(items) {
            items.forEach(function (it) {
                it.item.dispose();
            });
        }
    }, {
        key: '_onNamespaceRemoved',
        value: function _onNamespaceRemoved(items) {
            items.forEach(function (it) {
                it.item.dispose();
            });

            this._emitEvent(Events.namespace.childRemoved, items);
        }
    }, {
        key: '_onModelRemoved',
        value: function _onModelRemoved(items) {

            this._emitEvent(Events.namespace.modelRemoved, items);
        }
    }, {
        key: '_onInstanceRemoved',
        value: function _onInstanceRemoved(items) {

            this._emitEvent(Events.namespace.instanceRemoved, items);
        }
    }, {
        key: 'context',
        get: function get() {
            return this._context;
        }
    }, {
        key: 'children',
        get: function get() {
            return this._children;
        }
    }, {
        key: 'models',
        get: function get() {
            return this._models;
        }
    }, {
        key: 'instances',
        get: function get() {
            return this._instances;
        }
    }, {
        key: 'qualifiedObjects',
        get: function get() {
            return this._qualifiedObjects;
        }
    }, {
        key: 'root',
        get: function get() {
            var current = this.parent;

            if (current == null) {
                return this;
            }

            while (current != null) {
                if (current.parent == null) {
                    break;
                }

                current = current.parent;
            }

            return current;
        }

        // Provided a starting namespace, will search for the relative
        // ancestor from a qualifiedName

    }], [{
        key: 'findRelative',
        value: function findRelative(startNamespace, qualifiedName) {
            // current is the root at this point
            var tokens = qualifiedName.split('.');

            if (tokens.length == 1 && tokens[0] === startNamespace.name) {
                return startNamespace;
            }

            var current = startNamespace;
            for (var i = 0; i < tokens.length; i++) {
                var token = tokens[i];
                current = current.children.findByName(token);

                if (current == null) {
                    return null;
                }
            }

            return current;
        }
    }]);
    return Namespace;
}(QualifiedObject);

module.exports = Namespace;