var xml = require('./xml'),
	_ = require('underscore'),
	logger = require('./logger'),
	os = require('os');

exports.read = function(strings_path) {
	var doc, result = {};

	if (doc = xml.fromFile(strings_path)) {

		var elements = doc.getElementsByTagName('string');

		_.each(elements, function(node) {
			result[node.attributes.getNamedItem('name').nodeValue] = node.childNodes.item(0).nodeValue.replace(/"(.+)"/, '$1');
		});

	} else {
		logger.warn('Could not read strings from: ' + strings_path);
	}

	return result;
};

exports.update = function(strings_path, strings_update) {
	var doc = xml.fromFile(strings_path);

	if (doc) {
		logger.info('Updating ' + _.size(strings_update) + ' strings in file: ' + strings_path);

		var elements = doc.getElementsByTagName('string');

		_.each(elements, function(node) {
			var name = node.attributes.getNamedItem('name').nodeValue;

			if (strings_update[name]) {
				node.replaceChild(doc.createTextNode(strings_update[name]), node.childNodes.item(0));
			}
		});

		xml.toFile(doc, strings_path);

	} else {
		logger.error('Could not read strings from: ' + strings_path);
		process.exit();
	}
};

exports.append = function(strings_path, strings_append) {
	var doc = xml.fromFile(strings_path);

	if (doc) {
		logger.info('Appending ' + _.size(strings_append) + ' strings to existing file: ' + strings_path);

	} else {
		doc = xml.fromString('<?xml version="1.0" encoding="UTF-8"?>' + os.EOL + '  <resources />');

		logger.info('Adding ' + _.size(strings_append) + ' strings to new file: ' + strings_path);
	}

	var root = doc.documentElement;

	_.each(strings_append, function(string) {
		var node = doc.createElement('string');
		var value = doc.createTextNode(string);
		node.setAttribute('name', string);
		root.appendChild(doc.createTextNode('  '));
		node.appendChild(value);
		root.appendChild(node);
		root.appendChild(doc.createTextNode(os.EOL));
	});

	xml.toFile(doc, strings_path);
}