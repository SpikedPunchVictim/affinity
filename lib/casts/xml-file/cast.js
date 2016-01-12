'use strict';

var Cast = require('../cast.js');
var Project = require('../../project.js');

class XmlFileCast extends Cast {
    constructor() {
        super();
        this.saveDirectory = '';
        super.handle(Project.events.open, this.open.bind(this));
        super.handle(Project.events.commit, this.commit.bind(this));
    }
    
    open() {
        console.log('XmlFileCast: Opening Project');
    }
    
    commit() {
        console.log('XmlFileCast: Saving Project');
    }
}

exports = XmlFileCast;