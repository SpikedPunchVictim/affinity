var MemberCollection = require('./collections/memberCollection.js');
var QualifiedObject = require('./qualifiedObject.js');
var util = requires('utils');

function Instance(name, parent, model) {
    if(model == null) {
        throw new Error(util.format('model must be valid when creating an instance (name: %s)',name));
    }

    QualifiedObject.call(this, name, parent);

    this._fields = new MemberCollection();
    this._model = model;

    var init = function initialize() {
        for(var index in model.fields) {
            var field = model.fields[index];
        }
    };

    init();
}

util.inherits(Instance, QualifiedObject);

Object.defineProperty(Model, 'fields', {
    get: function() {
        return this._fields;
    }
});

Object.defineProperty(Model, 'model', {
    get: function() {
        return this.model;
    }
});