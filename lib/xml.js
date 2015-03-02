var xmldom = require('xmldom'),
	fs = require('fs-extended'),
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
			logger.error(['Error parsing XML file.'].concat((m || '').split(/[\r\n]/)));
			process.exit(1);
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
		process.exit(1);
	}

	return doc;
};

exports.toString = function(doc) {
	return new xmldom.XMLSerializer().serializeToString(doc);
};

exports.toFile = function(doc, path) {
	return fs.createFileSync(path, exports.toString(doc));
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