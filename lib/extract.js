var logger = require('./logger'),
	fs = require('fs'),
	path = require('path'),
	wrench = require('wrench'),
	xmldom = require('xmldom'),
	os = require('os'),
	_ = require('underscore');

var searchString = "(?:L|Ti.Locale.getString|Titanium.Locale.getString)" +
	"\\(\\s*[\"']([a-zA-Z]\\w*?)[\"']\\s*[\\),]";

var config = {};
config.searchRegex = new RegExp(searchString, 'g');
config.valueRegex = new RegExp(searchString);
config.project = {};
config.language = 'en';

function extractStrings(path) {

	try {
		var files = wrench.readdirSyncRecursive(config.project.path_source);

		var styleSuffix = '.tss';
		var controllerSuffix = '.js';

		// filter only js and style files
		files = _.filter(files, function(f) {
			return f.substr(-styleSuffix.length) === styleSuffix ||
				f.substr(-controllerSuffix.length) === controllerSuffix;
		});

		var strings = [];
		_.each(files, function(f) {
			var file = path.join(config.project.path_source, f);
			var fileContent = fs.readFileSync(file, 'utf8');
			var calls = fileContent.match(config.searchRegex);

			if (calls && calls.length > 0) {
				logger.debug(file + ': ' + calls.length + ' strings found.');

				_.each(calls, function(call) {
					var matches = call.match(config.valueRegex);
					strings.push(matches[1]);
				});
			}
		});

		strings = _.uniq(strings);
		logger.info("Found " + strings.length + " unique i18n strings in code. Checking against current i18n file...");
		return strings;

	} catch (err) {
		return [];
	}
}

function check(strings) {
	if (!strings || strings.length === 0) {
		logger.warn('No new i18n strings found. Nothing to do.');
		process.exit(0);
	}
}

function parseFromFile(path) {
	var doc;
	try {
		var errorHandler = {};
		errorHandler.error = errorHandler.fatalError = function(m) {
			logger.error(['Error parsing XML file.'].concat((m || '').split(/[\r\n]/)));
			process.exit();
		};
		errorHandler.warn = errorHandler.warning = function(m) {
			logger.warn((m || '').split(/[\r\n]/));
		};
		doc = new xmldom.DOMParser({
			errorHandler: errorHandler,
			locator: {}
		}).parseFromString(fs.readFileSync(path, 'utf8'));
	} catch (e) {
		logger.error('Error parsing XML file.');
		process.exit();
	}

	return doc;
};

function generate(strings) {
	var doc = parseFromFile(config.path_absolute);
	var root = doc.documentElement;

	// create a <string> node for each new string key
	_.each(strings, function(str) {
		var node = doc.createElement('string');
		var value = doc.createTextNode(str);
		node.setAttribute('name', str);
		root.appendChild(doc.createTextNode('  '));
		node.appendChild(value);
		root.appendChild(node);
		root.appendChild(doc.createTextNode('\n'));
	});

	// serialize the document and write it back to the strings.xml file
	var serializer = new xmldom.XMLSerializer();
	return serializer.serializeToString(doc);
}

function merge(strings) {
	var doc = parseFromFile(config.path_absolute);
	var oldStrings = _.map(doc.getElementsByTagName('string'), function(node) {
		return node.attributes.getNamedItem('name').nodeValue;
	});
	return _.difference(strings, oldStrings);
}

function write(strings) {
	check(strings);
	fs.writeFileSync(config.path_absolute, generate(strings), 'utf8');
	logger.info(('Wrote strings in the "' + config.path_relative + '" file.').green);
}

module.exports = function(env) {
	config.project = env.project;

	if (env._[0]) {
		config.language = env._[0];
	}

	config.path_absolute = path.join(config.project.path, 'i18n', config.language, 'strings.xml');
	config.path_relative = path.relative(config.project.path, config.path_absolute);

	logger.info('i18n extract for "' + config.path_relative + '"');

	var strings = extractStrings(path);
	var newStrings = merge(strings);

	if (env.apply) {
		write(newStrings);

	} else {
		check(strings);
		logger.info('######## BEFORE ########' + os.EOL + generate([]));
		logger.info('######## AFTER  ########' + os.EOL + generate(newStrings));
		logger.info(' ');
		logger.warn('Did not write the "' + config.path_relative + '" file - use "--apply" option to write.');
	}
};