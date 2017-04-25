const assert = require('assert');
const affinity = require('../lib/index.js');
const fill = require('../lib/testing.js').fill
const expect = require('chai').expect;

describe("Project", function() {
    it('should contain a root Namespace', function() {
        let proj = affinity.create();
        expect(proj).to.have.property('root');
    });

    it('should fill correctly', function() {
        let proj = affinity.create();
        fill.project(proj)
    })
    // Test:
    //  - Model events when adding members
    //  - Instance events when updating fields
    //  - Field events when updating members

});