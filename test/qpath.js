'use strict';

var expect = require('chai').expect;
var qpath = require('../lib/qpath.js');

describe('qpath', function() {

   describe('API', function() {

      it('#basename', function() {
         let one = 'one';
         let two = 'one.two';
         let three = 'one.two.three';
         let four = 'one.two.three.four';

         expect(qpath.basename(one)).to.be.equal('one');
         expect(qpath.basename(two)).to.be.equal('two');
         expect(qpath.basename(three)).to.be.equal('three');
         expect(qpath.basename(four)).to.be.equal('four');
      });

      it('#parent', function() {
         let zero = '';
         let one = 'one';
         let two = 'one.two';
         let three = 'one.two.three';
         let four = 'one.two.three.four';

         let y = qpath.parent(three);

         expect(qpath.parent(zero)).to.be.null;
         expect(qpath.parent(one)).to.be.equal('');
         expect(qpath.parent(two)).to.be.equal('one');
         expect(qpath.parent(three)).to.be.equal('one.two');
         expect(qpath.parent(four)).to.be.equal('one.two.three');

      });

   });

})