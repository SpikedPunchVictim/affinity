var NamedObject = require('./namedObject.js');
var util = require('util');

module.exports = Member;

function Member(name, typeInfo, model) {
    NamedObject.mixin(this);
    this._typeInfo = typeInfo;
    this._model = model;
}

util.inherits(Member, NamedObject);

Object.defineProperty(Member, 'typeInfo', {
    get: function() {
        return this._typeInfo;
    }
});

Object.defineProperty(Member, 'model', {
    get: function() {
        return this._model;
    }
});