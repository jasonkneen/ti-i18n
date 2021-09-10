var logger = require('./logger'),
	fs = require('fs'),
	path = require('path'),
	wrench = require('wrench'),
	xml = require('./xml'),
	project = require('./project'),
	i18n = require('./i18n'),
	strings = require('./strings'),
	{Parser} = require("acorn"),
	walk = require("acorn-walk"),
	_ = require('underscore'),
	Table = require('ascii-table'),
	styler = require('alloy/Alloy/commands/compile/styler');

// https://github.com/appcelerator/alloy/blob/2ff172ce5d10e89f560d09d82a54a8410e52d0b1/Alloy/alloy.js#L18
path.existsSync = fs.existsSync || path.existsSync;

var config = {};
config.properties = ['titleid', 'textid', 'messageid', 'titlepromptid', 'subtitleid', 'hinttextid', 'promptid'];
config.valueRegExp = '\\(["\']([^"\']+)["\'](?:,\\s*["\']([^"\']+)["\'])?\\)';
config.styleRegExp = new RegExp('^' + styler.STYLE_EXPR_PREFIX + 'L' + config.valueRegExp + '$');
config.viewRegExp = new RegExp('^(?:Ti(?:tanium)?\\.Locale\\.getString|L)' + config.valueRegExp + '$');
config.project = {};
config.language = null;  

function normalize(str) {
	return str.replace('\n', '\\n');
}

function extractFromView(nodes, strings) {
	var elements = xml.filterNodes(nodes);

	_.each(elements, function(element) {

		_.each(element.attributes, function(attribute) {

			// atttribute is an i18n one
			if (_.contains(config.properties, attribute.name)) {
				strings.push(attribute.value);

			} else {
				var match = attribute.value.match(config.viewRegExp);

				// value is an L() or Ti.Locale.getString() expression
				if (match !== null) {
					strings.push(normalize(match[1]));
				}
			}
		});

		// recurse
		if (element.hasChildNodes) {
			extractFromView(element.childNodes, strings);
		}
	});

	return strings;
}

function extractFromStyle(style, strings) {

	_.each(style, function(value, property) {

		// is value
		if (_.isString(value)) {

			// is i18n property
			if (_.contains(config.properties, property)) {
				strings.push(value);

			} else {
				var match = value.match(config.styleRegExp);

				// is L() expression (Ti.Locale.toString is normalized by Alloy)
				if (match !== null) {
					strings.push(normalize(match[1]));
				}
			}

			// recurse
		} else if (_.isObject(value)) {
			extractFromStyle(value, strings);
		}
	});

	return strings;
}

function extractFromController(file_path) {
	var strings = [];  

	var result = Parser.parse(fs.readFileSync(file_path, 'utf8'), {
		sourceType: 'module'
	});

	walk.simple(result, {
		CallExpression(node) {
		  if (node && node.callee && node.callee.name) {
			var functionName = node.callee.name;

			if (functionName === 'L') {
				var value = node.arguments[0].value;
				if (value !== undefined) {
					strings.push(value);	
				}
			}
		  }
		}
	});

	return strings;
}

function extract(source_path) {

	try {
		var files = wrench.readdirSyncRecursive(source_path),
			strings = [];

		_.each(files, function(file_name) {
			if (fs.statSync(path.join(source_path, file_name)).isDirectory()) {
				return;
			}

			var extension = file_name.split('.').pop(),
				file_path = path.join(source_path, file_name),
				found = [];

			if (extension === 'js') {
				found = exports.extractFromController(file_path);

			} else if (config.project.alloy) {

				if (extension === 'tss') {
					found = exports.extractFromStyle(file_path);

				} else if (extension === 'xml') {
					found = exports.extractFromView(file_path);

				} else {
					return;
				}

			} else {
				return;
			}

			if (found.length > 0) {
				logger.debug('Found ' + found.length + ' strings in: ' + file_path);

				strings = _.union(strings, found);
			}
		});

		strings = _.uniq(strings);

		logger.info("Found " + strings.length + " unique strings in: " + source_path);

		return strings;

	} catch (err) {
		logger.error('' + err);

		return [];
	}
}

exports.extractFromView = function(file_path) {
	return extractFromView(xml.fromFile(file_path).childNodes, []);
};

exports.extractFromStyle = function(file_path) {
	return extractFromStyle(styler.loadStyle(file_path), []);
};

exports.extractFromController = extractFromController;
exports.extract = extract;

exports.run = function(options) {
	options = options || {};

	config.project = project.info(options.projectDir);
	config.language = options.language || null;
	config.apply = options.opts().apply || false;

	// languages to merge with
	var languages = config.language ? [config.language] : i18n.getLanguages(path.join(config.project.path, 'app', 'i18n'));

	if (languages.length < 1) {
		process.exit(0);
	}

	// extraxt strings from source
	var strings_extracted = extract(config.project.path_source);

	// no extracted strings > done
	if (strings_extracted.length === 0) {
		process.exit(0);
	}

	var table, rows = {};

	// each language
	_.each(languages, function(language) {
		var language_path = path.join(config.project.path, 'app', 'i18n', language, 'strings.xml');

		var strings_existing = _.keys(strings.read(language_path));
		var strings_new = _.difference(strings_extracted, strings_existing);

		// found new strings for this language
		if (strings_new.length > 0) {

			// apply
			if (config.apply) {
				strings.append(language_path, strings_new);
			}

			// set/update row
			_.each(strings_new, function(string) {

				if (rows[string]) {
					rows[string].push(language);
				} else {
					rows[string] = [language];
				}
			});
		}
	});

	var strings_new_count = _.size(rows);

	logger.info('Found ' + strings_new_count + ' strings missing in one or more languages.');

	// no new strings > done
	if (strings_new_count === 0) {
		process.exit(0);
	}

	// set-up table
	table = new Table();
	table.setHeading.apply(table, _.union(['String to append to:'], languages));

	// add rows to table
	_.each(rows, function(languages_new, string) {
		var row = [string];

		_.each(languages, function(language) {
			row.push(_.contains(languages_new, language) ? 'YES' : 'NO');
		});

		table.addRow.apply(table, row);
	});

	// log table
	console.log(table.toString());

	if (!config.apply) {
		console.log("To actually apply the changes: -a, --apply (CLI) or 'apply' (module)".yellow);
	}
};
