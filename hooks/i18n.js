var mod = require('../module'),
	_ = require('underscore');

var subcommands = {};

// get the module's commands without the non-hook ones
_.each(mod.commands, function (conf, cmd) {
	if (conf.hook !== false) {
		subcommands[cmd] = conf;
	}
});

exports.cliVersion = '>=3.2';
exports.title = mod.package.about.name;
exports.desc = mod.package.description;

exports.config = function(logger, config, cli) {
	return {
		noAuth: true,
		skipBanner: false,
		subcommands: subcommands
	}
};

exports.run = function(logger, config, cli, finished) {
	var subcommand = cli.argv._.shift();

	// valid command
	if (subcommands[subcommand]) {

		// command has a callback
		if (_.isFunction(subcommands[subcommand].action)) {
			subcommands[subcommand].action.call(this, cli.argv);
		}

		// just assume command is an export of the module
		else {
			mod[subcommand].call(this, cli.argv);
		}
	}

	// invalid command > show help
	else {
		cli.globalContext.printHelp(logger, config, cli, cli.argv.$command, subcommand, finished);
	}
};