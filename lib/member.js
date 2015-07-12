var NamedObject = require('./namedObject.js');
var util = require('util');

module.exports = Member;

function Member(name, typeInfo, model) {
    NamedObject.mixin(this);
    this.type = typeInfo;
    this.model = model;
}

util.inherits(Member, NamedObject);
