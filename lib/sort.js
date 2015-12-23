var project = require('./project'),
  i18n = require('./i18n'),
  _ = require('underscore'),
  strings = require('./strings'),
  path = require('path'),
  fs = require('fs'),
  logger = require('./logger');

exports.run = function(options) {
  options = options || {};

  var project_info = project.info(options.projectDir),
    languages = i18n.getLanguages(project_info.path_i18n);

  options = options || {};

  if (languages.length === 0) {
    process.exit(0);
  }

  _.each(languages, function(language) {
		var stringsPath = path.join(project_info.path_i18n, language, 'strings.xml');
    var stringsSorted = exports.readAndSort(stringsPath);

    // remove old
    logger.info('Removing ' + _.size(stringsSorted) + ' strings from old file: ' + stringsPath);
    fs.unlinkSync(stringsPath);

    // write new
    strings.append(stringsPath, stringsSorted);
  });
};

exports.readAndSort = function(stringsPath) {
  var stringsUnsorted = strings.read(stringsPath);

  // sort object keys
  var stringsKeys = _.keys(stringsUnsorted);
  stringsKeys.sort(function(a, b) {
    return a.toLowerCase().localeCompare(b.toLowerCase());
  });

  var stringsSorted = {};

  logger.info('Sorting ' + stringsKeys.length + ' strings from file: ' + stringsPath);

  // populates sorted object
  _.each(stringsKeys, function(key) {
    stringsSorted[key] = stringsUnsorted[key];
  });

	return stringsSorted;
};
