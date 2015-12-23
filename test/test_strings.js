var assert = require('assert'),
  path = require('path'),
  _ = require('underscore');

var strings = require('./../lib/strings');

describe('lib/strings', function() {

  describe('read(source/strings_sort.xml)', function() {
    var expected = {
        'Episode {partNumber} added': 'Episode "{partNumber}" added'
      },
      actual;

    it('should not throw an error', function() {
      assert.doesNotThrow(function() {
        actual = strings.read(path.join(__dirname, 'source/strings_sort.xml'));
      });
    });

    it('should return expected result', function() {
      assert.deepEqual(actual, expected);
    });
  });
});
