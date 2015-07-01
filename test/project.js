var assert = require('assert');
var gaia = require('../lib/index.js');
var expect = require('chai').expect;

describe("Project", function() {
    it('should contain a root Namespace', function() {
        var proj = gaia.create();
        expect(proj).to.have.property('root');
    });
});