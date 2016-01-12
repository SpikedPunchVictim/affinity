'use strict';
var gaia = require('./lib/index.js');

var project = gaia.create();
var newModel = project.root.models.addModel('new_model');
var newInstance = project.root.instances.addInstance('new_instance', newModel);
newModel.members.addMember('boolean', 'free', {value: false});