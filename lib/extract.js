var logger = require('./logger'),
	fs = require('fs'),
	path = require('path'),
	wrench = require('wrench'),
	xml = require('./xml'),
	i18n = require('./i18n'),
	strings = require('./strings'),
	os = require('os'),
	UglifyJS = require('uglify-js')
	_ = require('underscore'),
	Table = require('ascii-table'),
	styler = require('alloy/Alloy/commands/compile/styler'),
	colors = require('colors');

var config = {};
config.properties = ['titleid', 'textid', 'messageid', 'titlepromptid', 'subtitleid', 'hinttextid', 'promptid'];
config.valueRegExp = '\\(["\']([^"\']+)["\'](?:,\\s*["\']([^"\']+)["\'])?\\)';
config.styleRegExp = new RegExp('^' + styler.STYLE_EXPR_PREFIX + 'L' + config.valueRegExp + '$');
config.viewRegExp = new RegExp('^(?:Ti(?:tanium)?\\.Locale\\.getString|L)' + config.valueRegExp + '$');
config.project = {};
config.language = null;

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
					strings.push(match[1]);
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
					strings.push(match[1]);
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

	UglifyJS.parse(fs.readFileSync(file_path, 'utf8')).walk(new UglifyJS.TreeWalker(function(node) {

		// Function call
		if (node instanceof UglifyJS.AST_Call) {

			// L(<?>[, <?>])
			if (typeof node.expression.name === 'string' && node.expression.name === 'L') {

				// L(<string>[, <?>])
				if (node.args[0] instanceof UglifyJS.AST_String) {
					strings.push(node.args[0].value);
				}
			}

			// Ti.<?>
			else if (node.expression.start.value.match && node.expression.start.value.match("^Ti(tanium)?$")) {

				// Ti.Locale.getString(<string>[, <?>])
				if (node.expression.expression.property === "Locale" && node.expression.end.value === "getString" && node.args[0] && node.args[0] instanceof UglifyJS.AST_String) {
					strings.push(node.args[0].value);
				}
			}

			// <string>([<?>])
			else if (node.expression.end.value.match) {
				var matches = node.expression.end.value.match("^set([A-Z][a-z]+id)$");

				// set<?>id(<string>[, <?>])
				if (matches !== null && node.args[0] && node.args[0] instanceof UglifyJS.AST_String) {

					// .set<property>id(<string>[, <?>])
					if (_.contains(config.properties, matches[1].toLowerCase())) {
						strings.push(node.args[0].value);
					}
				}
			}

			// Variable assignment (=)
		} else if (node instanceof UglifyJS.AST_Assign) {

			// object.titleid = <string>
			if (node.right instanceof UglifyJS.AST_String && node.left.property && node.left.property.match && _.contains(config.properties, node.left.property)) {
				strings.push(node.right.value);
			}

			// Object property (:)
		} else if (node instanceof UglifyJS.AST_ObjectKeyVal) {

			// { <property>: <string> }
			if (node.value instanceof UglifyJS.AST_String && typeof node.key === 'string' && _.contains(config.properties, node.key)) {
				strings.push(node.value.value);
			}
		}

	}));

	return strings;
}

function extract(source_path) {

	try {
		var files = wrench.readdirSyncRecursive(source_path),
			strings = [];

		_.each(files, function(file_name) {

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

function writeStrings(file_path, strings_new) {
	var doc = xml.fromFile(file_path) || xml.fromString('<?xml version="1.0" encoding="UTF-8"?>' + os.EOL + '  <resources />'),
		root = doc.documentElement;

	_.each(strings_new, function(string) {
		var node = doc.createElement('string');
		var value = doc.createTextNode(string);
		node.setAttribute('name', string);
		root.appendChild(doc.createTextNode('  '));
		node.appendChild(value);
		root.appendChild(node);
		root.appendChild(doc.createTextNode(os.EOL));
	});

	xml.toFile(doc, file_path);
}

exports.extractFromView = function(file_path) {
	return extractFromView(xml.fromFile(file_path).childNodes, []);
};

exports.extractFromStyle = function(file_path) {
	return extractFromStyle(styler.loadStyle(file_path), []);
};

exports.extractFromController = extractFromController;
exports.extract = extract;

exports.run = function(env) {
	config.project = env.project;
	config.language = env._[0] || null;
	config.apply = env.apply || false;

	// languages to merge with
	var languages = config.language ? [config.language] : i18n.getLanguages(path.join(config.project.path, 'i18n'));

	if (languages.length <= 1) {
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
		var language_path = path.join(config.project.path, 'i18n', language, 'strings.xml');

		var strings_existing = strings.read(language_path);
		var strings_new = _.difference(strings_extracted, strings_existing);

		// found new strings for this language
		if (strings_new.length > 0) {

			// apply
			if (config.apply) {
				writeStrings(language_path, strings_new);
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
		console.log('Use the "--apply" flag to actually append the missing strings to the files.'.yellow);
	}
};