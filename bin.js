#!/usr/bin/env node

const commander = require('commander');
const _ = require('underscore');
const config = require('./config');
const main = require('./main');

const program = new commander.Command()

program
    .version(config.package.version, '-v, --version')
    .description(config.package.about.name)
    .usage('command [options]');

// expose the module's commands to the program
_.each(config.commands, function(config, name) {

    // for the CLI
    if (config.cli !== false) {
        let usage = name;

        // args
        if (config.args) {

            _.each(config.args, function(arg) {
                usage += (arg.required === true || (arg.required !== false && _.has(arg, 'default') === false)) ? ' <' + arg.name + '>' : ' [' + arg.name + ']';
            });
        }

        // command
        const command = program.command(usage)
            .description(config.desc.grey)
            .action(function() {

                // format like we get it when being an hook
                const args = _.flatten(arguments),
                    argv = args.pop();
                argv._ = args;

                // either called specified action
                if (_.isFunction(config.action)) {
                    config.action(argv);
                }

                // or assume it's an exported method for the module
                else {
                    main[name](argv);
                }
            });

        // flags
        if (config.flags) {
            _.each(config.flags, function(cf, flag) {
                let inst = [];

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
                let inst = [];

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
    config.banner(false);
}

program.parse(process.argv);

// show help when we don't have a valid arg
if (program.args.length === 0 || typeof program.args[program.args.length - 1] === 'string') {
    config.banner(false);
    program.help();
}