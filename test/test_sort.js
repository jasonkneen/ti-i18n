var assert = require('assert'),
  path = require('path'),
  _ = require('underscore');

var sort = require('./../lib/sort');

describe('ti-i18n sort >', function() {

  describe('readAndSort(source/strings_sort.xml)', function() {
    var expected = {
        'Episode {partNumber} added': 'Episode "{partNumber}" added'
      },
      actual;

    it('should not throw an error', function() {
      assert.doesNotThrow(function() {
        actual = sort.readAndSort(path.join(__dirname, 'source/strings_sort.xml'));
      });
    });

    it('should return expected result', function() {
      assert.deepEqual(actual, expected);
    });
  });
});
