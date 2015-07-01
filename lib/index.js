var Project = require('./project.js');

module.exports.create = Project.create;
module.exports.open = Project.open;

function create() {
    return new Project();
}