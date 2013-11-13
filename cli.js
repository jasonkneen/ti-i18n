#!/usr/bin/env node

var program = require('commander'),
    colors = require('colors'),
    _ = require('underscore'),
    mod = require('./module');

program
    .version(mod.package.version, '-v, --version')
    .description(mod.package.about.name)
    .usage('command [options]');

// expose the module's commands to the program
_.each(mod.commands, function(config, name) {

    // for the CLI
    if (config.cli !== false) {
        var usage = name;

        // args
        if (config.args) {

            _.each(config.args, function(arg) {
                usage += arg.required ? ' <' + arg.name + '>' : ' [' + arg.name + ']';
            });
        }

        // command
        var command = program.command(usage)
            .description(config.desc.grey)
            .action(function() {

                // format like we get it when being an hook
                var args = _.flatten(arguments),
                    argv = args.pop();
                argv._ = args;

                // either called specified action
                if (_.isFunction(config.action)) {
                    config.action(argv);
                }

                // or assume it's an exported method for the module
                else {
                    mod[name](argv);
                }
            });

        // flags
        if (config.flags) {
            _.each(config.flags, function(cf, flag) {
                var inst = [];

                if (cf.abbr) {
                    inst.push('-' + cf.abbr);
                }

                inst.push('--' + flag);

                command.option(inst.join(', '), cf.desc);
            });
        }

        // options
        if (config.options) {
            _.each(config.options, function(cf, option) {
                var inst = [];

                if (cf.abbr) {
                    inst.push('-' + cf.abbr);
                }

                inst.push('--' + option + (cf.hint ? ' <' + cf.hint + '>' : ''));

                command.option(inst.join(', '), cf.desc);
            });
        }
    }
});

// display banner for help
if (_.intersection(process.argv, ['-h', '--help']).length > 0) {
    mod.banner(false);
}

program.parse(process.argv);

// show help when we don't have a valid arg
if (program.args.length === 0 || typeof program.args[program.args.length - 1] === 'string') {
    mod.banner(false);
    program.help();
}