var assert = require('assert'),
	path = require('path'),
	_ = require('underscore');

var extract = require('./../lib/extract');

describe('ti-i18n extract >', function() {

	/*
	describe('readLanguages(target)', function() {
		var expected = 'en,nl',
			actual;

		it('should not throw an error', function() {
			assert.doesNotThrow(function() {
				actual = extract.readLanguages(path.join(__dirname, 'target')).join(',');
			});
		});

		it('should find all languages', function() {
			assert.strictEqual(actual, expected);
		});

	});

	describe('readStrings(target/en/strings.xml)', function() {
		var expected = 'foo',
			actual;

		it('should not throw an error', function() {
			assert.doesNotThrow(function() {
				actual = extract.readStrings(path.join(__dirname, 'target', 'en', 'strings.xml')).join(',');
			});
		});

		it('should find all strings', function() {
			assert.strictEqual(actual, expected, 'but found ' + actual + ' instead.');
		});

	});
	*/

	describe('extractFromController(source/controller.js)', function() {
		var expected = [
			'aa', 'ab', 'ac', 'ad', 'ae', 'af', 'ag',
			'ba', 'bb', 'bc', 'bd', 'be', 'bf',
			'ca', 'cb', 'cc', 'cd', 'ce', 'cf', 'cg',
			'da', 'db', 'dc',
			'ea', 'eb', 'ec', 'ed', 'ee', 'ef', 'eg',
			'issue\\n14'
		],
			actual;

		it('should not throw an error', function() {
			assert.doesNotThrow(function() {
				actual = extract.extractFromController(path.join(__dirname, 'source', 'controller.js'));
			});
		});

		it('should not miss expected strings', function() {
			var missing = _.difference(expected, actual);
			assert.strictEqual(missing.length, 0, missing.join(', '));
		});

		it('should not find unexpected strings', function() {
			var unexpected = _.difference(actual, expected);
			assert.strictEqual(unexpected.length, 0, unexpected.join(', '));
		});
	});

	describe('extractFromStyle(source/style.tss)', function() {
		var expected = [
			'aa', 'ab', 'ac', 'ad', 'ae', 'af', 'ag',
			'ba', 'bb', 'bc'
		],
			actual;

		it('should not throw an error', function() {
			assert.doesNotThrow(function() {
				actual = extract.extractFromStyle(path.join(__dirname, 'source', 'style.tss'));
			});
		});

		it('should not miss expected strings', function() {
			var missing = _.difference(expected, actual);
			assert.strictEqual(missing.length, 0, missing.join(', '));
		});

		it('should not find unexpected strings', function() {
			var unexpected = _.difference(actual, expected);
			assert.strictEqual(unexpected.length, 0, unexpected.join(', '));
		});
	});

	describe('extractFromView(source/view.xml)', function() {
		var expected = [
			'aa', 'ab', 'ac', 'ad', 'ae', 'af', 'ag',
			'ba', 'bb',
			'ca', 'cb',
			'da', 'db'
		],
			actual;

		it('should not throw an error', function() {
			assert.doesNotThrow(function() {
				actual = extract.extractFromView(path.join(__dirname, 'source', 'view.xml'));
			});
		});

		it('should not miss expected strings', function() {
			var missing = _.difference(expected, actual);
			assert.strictEqual(missing.length, 0, missing.join(', '));
		});

		it('should not find unexpected strings', function() {
			var unexpected = _.difference(actual, expected);
			assert.strictEqual(unexpected.length, 0, unexpected.join(', '));
		});
	});
});
