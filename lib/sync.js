var project = require('./project'),
	i18n = require('./i18n'),
	_ = require('underscore'),
	strings = require('./strings'),
	path = require('path'),
	Table = require('ascii-table'),
	logger = require('./logger'),
	colors = require('colors');

exports.run = function(options) {
	options = options || {};

	var project_info = project.info(options.projectDir),
		languages = i18n.getLanguages(project_info.path_i18n),
		strings_found = [],
		strings_missing = [],
		strings_language_found = {},
		strings_language_missing = {},
		paths_language = {};

	options = options || {};

	if (languages.length <= 1) {
		process.exit(0);
	}

	// first run: collect all strings
	_.each(languages, function(language) {
		paths_language[language] = path.join(project_info.path_i18n, language, 'strings.xml');
		strings_language_found[language] = _.keys(strings.read(paths_language[language]));

		if (strings_language_found[language].length > 0) {
			strings_found = _.union(strings_found, strings_language_found[language]);
		}
	});

	logger.info('Found ' + strings_found.length + ' strings.');

	if (strings_found.length === 0) {
		process.exit(0);
	}

	// second run: sync strings
	_.each(languages, function(language) {
		strings_language_missing[language] = _.difference(strings_found, strings_language_found[language]);

		if (strings_language_missing[language].length > 0) {
			strings_missing = _.union(strings_missing, strings_language_missing[language]);

			if (options.opts().apply) {
				strings.append(paths_language[language], strings_missing);
			}
		}
	});

	logger.info('Found ' + strings_missing.length + ' missing strings in one or more languages.');

	if (strings_missing.length === 0) {
		process.exit(0);
	}

	var table = new Table();
	table.setHeading.apply(table, _.union(['String to append to:'], languages));

	// add rows to table
	_.each(strings_missing, function(string) {
		var row = [string];

		_.each(languages, function(language) {
			row.push(_.contains(strings_language_missing[language], string) ? 'YES' : '');
		});

		table.addRow.apply(table, row);
	});

	// log table
	console.log(table.toString());

	if (!options.apply) {
		console.log("To actually apply the changes: -a, --apply (CLI) or 'apply' (module)".yellow);
	}
};