var xml = require('./xml'),
	_ = require('underscore'),
	logger = require('./logger'),
	os = require('os');

exports.read = function(strings_path) {
	var doc;

	if (doc = xml.fromFile(strings_path)) {

		return _.map(doc.getElementsByTagName('string'), function(node) {
			return node.attributes.getNamedItem('name').nodeValue;
		});

	} else {
		logger.warn('Could not read strings from: ' + strings_path);
		return [];
	}
};

exports.append = function(strings_path, strings_append) {
	var doc = xml.fromFile(strings_path);

	if (doc) {		
		logger.info('Appending ' + strings_append.length + ' strings to existing file: ' + strings_path);

	} else {
		doc = xml.fromString('<?xml version="1.0" encoding="UTF-8"?>' + os.EOL + '  <resources />');

		logger.info('Adding ' + strings_append.length + ' strings to new file: ' + strings_path);
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