var fs = require('fs'),
	_ = require('underscore'),
	path = require('path'),
	logger = require('./logger');

exports.getLanguages = function(i18n_path) {
	var languages = [];

	if (fs.existsSync(i18n_path)) {
		var files = fs.readdirSync(i18n_path);

		_.each(files, function(file) {
			var stat = fs.statSync(path.join(i18n_path, file));

			if (stat.isDirectory()) {
				languages.push(file);
			}
		});
	}

	logger.info('Found ' + languages.length + ' languages in: ' + i18n_path);

	return languages;
};