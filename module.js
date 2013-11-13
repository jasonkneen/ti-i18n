var fs = require("fs"),
    path = require("path"),
    fields = require('fields'),
    _ = require('underscore'),
    package = require('./package.json'),
    exec = require('exec'),
    logger = require("./lib/logger");

// basic config
var config = {};
config.hooks_path = __dirname + '/hooks';
config.banner = true;

// export stuff for CLI and hook integration
exports.package = package;
exports.commands = {
    extract: {
        desc: 'extract i18n strings from the source code (js and tss files)',
        args: [
            {
                name: 'language',
                desc: 'single language to extract for',
                default: 'en'
            }
        ],
        flags: {
            apply: {
                abbr: 'a',
                desc: 'write back to the strings.xml file'
            }
        }
    },
    hook: {
        hook: false,
        desc: 'hook ti-i18n into Titanium CLI as: ti i18n'
    },
    unhook: {
        desc: 'unhook ti-i18n from Titanium CLI'
    },
    hooked: {
        hook: false,
        desc: 'check if ti-i18n is hooked into Titanium CLI'
    }
};


function execute(executable, params, callback) {
    params.unshift(executable);
    callback = _.isFunction(callback) ? callback : function() {};

    exec(params, callback);
}

function getProject() {
    var project = {};
    project.path = process.cwd();

    if (!fs.existsSync(path.join(project.path, 'tiapp.xml'))) {
        logger.error("Must be called in a Titanium project's root directory");
        process.exit();
    }

    project.path_alloy = path.join(project.path, 'app');
    project.alloy = fs.existsSync(project.path_alloy);
    project.path_resources = path.join(project.path, 'Resources');
    project.path_source = project.alloy ? project.path_alloy : project.path_resources;

    return project;
}

exports.banner = function(whitespace) {

    if (config.banner) {
        console.log(package.about.name.cyan.bold + ', version ' + package.version);
        console.log(package.about.copyright);

        if (whitespace !== false) {
            console.log('');
        }

        config.banner = false;
    }
}

// Hook ti-i18n into the Titanium CLI
exports.hook = function() {
    exports.banner();

    exports.hooked(null, function(hooked) {

        if (hooked) {
            console.log('You already hooked ti-i18n as: ' + 'ti i18n'.green);

        } else {
            execute('ti', ['config', '-a', 'paths.commands', config.hooks_path]);

            console.log('You now hooked ti-i18n into ti as: ' + 'ti i18n'.green);
        }

    });
};

// Unhook ti-i18n from the Titanium CLI
exports.unhook = function() {
    exports.banner();

    exports.hooked(null, function(hooked) {

        if (hooked) {
            execute('ti', ['config', '-r', 'paths.commands', config.hooks_path]);

            console.log('Unhooked! Use ' + 'ti-i18n'.green + ' or hook it again: ' + 'ti-i18n hook'.green);

        } else {
            console.log('It looks like ti-i18n is currently not hooked'.green);
        }

    });
};

// Print or return (via callback) if we're hooked
exports.hooked = function(env, callback) {

    execute('ti', ['config', '-o', 'json-object'], function(err, out, code) {

        if (err) {
            logger.error(err);

        } else {
            var object = JSON.parse(out),
                hooked = _.contains(object.paths.commands, config.hooks_path);

            if (_.isFunction(callback)) {
                callback(hooked);

            } else {
                console.log(hooked ? 'yes'.green : 'no'.red);
            }
        }
    });
};

// Extract strings from source and save to strings.xml file
exports.extract = function(env) {
    env.project = getProject();

    require('./lib/extract').run(env);
};