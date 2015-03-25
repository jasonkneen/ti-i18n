var showedBanner = false;

exports.package = require('./package.json');

exports.commands = {
    extract: {
        desc: 'extract i18n strings from JS, TSS and XML files',
        options: {
            'project-dir': {
                abbr: 'd',
                desc: 'Project directory (default: current)',
                hint: 'path'
            },
            language: {
                abbr: 'l',
                desc: 'single language to compare with and write to (default: all)',
                hint: 'ln'
            }
        },
        flags: {
            apply: {
                abbr: 'a',
                desc: 'append to the strings.xml files (default: no)'
            }
        }
    },
    sync: {
        desc: 'sync strings between all languages',
        options: {
            'project-dir': {
                abbr: 'd',
                desc: 'Project directory (default: current)',
                hint: 'path'
            }
        },
        flags: {
            apply: {
                abbr: 'a',
                desc: 'append to the strings.xml files (default: no)'
            }
        }
    },
    sort: {
        desc: 'sort strings by key',
        options: {
            'project-dir': {
                abbr: 'd',
                desc: 'Project directory (default: current)',
                hint: 'path'
            }
        }
    },
    merge: {
        desc: 'merge (translated) strings file with given or default language',
        options: {
            'project-dir': {
                abbr: 'd',
                desc: 'Project directory (default: current)',
                hint: 'path'
            },
            source: {
                abbr: 's',
                desc: 'Source strings.xml file to merge from',
                hint: 'path'
            },
            language: {
                abbr: 'l',
                desc: 'language to compare with and merge to',
                hint: 'ln'
            }
        },
        flags: {
            apply: {
                abbr: 'a',
                desc: 'overwrite the strings.xml file (default: no)'
            }
        }
    },
    plug: {
        ti: false,
        desc: 'plug ti-i18n into Titanium CLI as: ti i18n'
    },
    unplug: {
        desc: 'unplug ti-i18n from Titanium CLI'
    },
    plugged: {
        ti: false,
        desc: 'check if ti-i18n is plugged into Titanium CLI'
    }
};

exports.banner = function(whitespace) {

    if (!showedBanner) {
        console.log(exports.package.about.name.cyan.bold + ', version ' + exports.package.version);
        console.log(exports.package.about.copyright);

        if (whitespace !== false) {
            console.log('');
        }

        showedBanner = true;
    }
};