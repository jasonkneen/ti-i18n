var xmldom = require('xmldom'),
	fs = require('fs'),
	logger = require('./logger');

exports.fromFile = function(path) {

	if (fs.existsSync(path)) {
		return exports.fromString(fs.readFileSync(path, 'utf8'));
	} else {
		return false;
	}
};

exports.fromString = function(string) {
	var doc;

	try {
		var errorHandler = {};
		errorHandler.error = errorHandler.fatalError = function(m) {
			exports.die(['Error parsing XML file.'].concat((m || '').split(/[\r\n]/)));
		};
		errorHandler.warn = errorHandler.warning = function(m) {
			logger.warn((m || '').split(/[\r\n]/));
		};
		doc = new xmldom.DOMParser({
			errorHandler: errorHandler,
			locator: {}
		}).parseFromString(string);

	} catch (e) {
		logger.error('Error parsing XML file.');
		process.exit();
	}

	return doc;
};

exports.toString = function(doc) {
	return new xmldom.XMLSerializer().serializeToString(doc);
};

exports.toFile = function(doc, path) {
	return fs.writeFileSync(path, exports.toString(doc), 'utf8');
};

exports.filterNodes = function(nodes, type) {
	type = type || 1;

	var filtered = [];

	if (nodes && nodes.length) {

		for (var i = 0, l = nodes.length; i < l; i++) {
			var node = nodes.item(i);

			if (node.nodeType === type) {
				filtered.push(node);
			}
		}
	}

	return filtered;
};