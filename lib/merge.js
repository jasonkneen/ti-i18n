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

	if (!options.source) {
		logger.error("Specify source strings.xml to merge from via: -s, --source (CLI) or 'source' (module)");
		process.exit();
	}

	if (!options.language) {
		logger.error("Specify target language to merge to: -l, --language (CLI) or 'language' (module)");
		process.exit();
	}

	var project_info = project.info(options.projectDir);

	var source = strings.read(options.source);

	if (_.size(source) === 0) {
		logger.error("No strings found in: " + options.source);
		process.exit();
	}

	var target_path = path.join(project_info.path_i18n, options.language, 'strings.xml'),
		target = strings.read(target_path),
		merged = _.extend({}, target, source),
		update = {},
		append = {};

	// set-up table
	table = new Table();
	table.setHeading('String', 'Action', 'Value');

	// add rows to table
	_.each(merged, function(after, name) {
		var action = 'NONE',
			color = 'white';

		if (!target[name]) {
			append[name] = after;

			action = 'APPEND';
			color = 'orange';
		}

		else if (target[name] !== after) {
			update[name] = after;

			action = 'UPDATE';
			color = 'green';
		}

		table.addRow(name, action, after[color]);
	});

	// log table
	console.log(table.toString());

	if (options.apply) {

		if (_.size(update) > 0) {
			strings.update(target_path, update);
		}

		if (_.size(append) > 0) {
			strings.append(target_path, append);
		}

	} else {
		console.log("To actually apply the changes: -a, --apply (CLI) or 'apply' (module)".yellow);
	}
};