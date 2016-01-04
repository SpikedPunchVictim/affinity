'use strict';

var util = require('util');
var Simple = require('./simple.js');
var Collection = require('./collection.js');
var Members = require('./members.js');
var Core = require('../core.js');
var Cast = require('../cast.js');

var rootCore = new Core();
var xmlFileCast = new Cast();

// Types
rootCore.types.define('bool', options => Simple.bool.type(options), options => Simple.bool.create(options));
rootCore.types.define('collection', options => Collection.type(options), options => Collection.create(options));
rootCore.types.define('decimal', options => Simple.decimal.type(options), options => Simple.decimal.create(options));
rootCore.types.define('int', options => Simple.int.type(options), options => Simple.int.create(options));
rootCore.types.define('string', options => Simple.string.type(options), options => Simple.string.create(options));
rootCore.types.define('uint', options => Simple.uint.type(options), options => Simple.uint.create(options));

// Members
rootCore.members.define('bool', (name, options) => new Members.BoolModelMember(name, options));
rootCore.members.define('collection', (name, options) => new Members.CollectionModelMember(name, options));
rootCore.members.define('decimal', (name, options) => new Members.DecimalModelMember(name, options));
rootCore.members.define('int', (name, options) => new Members.IntModelMember(name, options));
rootCore.members.define('string', (name, options) => new Members.StringModelMember(name, options));
rootCore.members.define('uint', (name, options) => new Members.UIntModelMember(name, options));

rootCore.members.onRequestForChange(req => {
    req.fulfill();
});
// Fields



exports = rootCore;