var fs = require("fs"),
    path = require("path"),
    fields = require('fields'),
    _ = require('underscore'),
    exec = require('exec'),
    config = require('./config'),
    logger = require("./lib/logger");

// Execute a shell command
function execute(executable, params, callback) {
    params.unshift(executable);
    callback = _.isFunction(callback) ? callback : function() {};

    exec(params, callback);
}

// Plug i18n into the Titanium CLI
exports.plug = function() {
    config.banner();

    exports.plugged(null, function(plugged) {

        if (!plugged) {
            execute('ti', ['config', '-a', 'paths.commands', path.join(__dirname, 'commands')]);
        }

        console.log('You can now use: ' + 'ti i18n'.green);
    });
};

// Unplug i18n from the Titanium CLI
exports.unplug = function() {
    config.banner();

    exports.plugged(null, function(plugged) {

        if (plugged) {
            execute('ti', ['config', '-r', 'paths.commands', path.join(__dirname, 'commands')]);
        }

        console.log('You can now only use: ' + 'ti-i18n'.green);
    });
};

// Print or return (via callback) if we're plugged into the Titanium CLI
exports.plugged = function(env, callback) {

    execute('ti', ['config', '-o', 'json-object'], function(err, out, code) {

        if (err) {
            logger.error(err);

        } else {
            var object = JSON.parse(out),
                plugged = _.contains(object.paths.commands, path.join(__dirname, 'commands'));

            if (_.isFunction(callback)) {
                callback(plugged);

            } else {
                console.log(plugged ? 'yes'.green : 'no'.red);
            }
        }
    });
};

// Extract strings from source and save to strings.xml file
exports.extract = function(options) {
    require('./lib/extract').run(options);
};

// Sync strings between languages
exports.sync = function(options) {
    require('./lib/sync').run(options);
};

// Merge (translated) strings back into language
exports.merge = function(options) {
    require('./lib/merge').run(options);
}
