# Titanium i18n [![Titanium](http://www-static.appcelerator.com/badges/titanium-git-badge-sq.png)](http://www.appcelerator.com/titanium/)

Titanium i18n (*ti-i18n*) is both a pluggable [Titanium](http://docs.appcelerator.com/titanium/latest/#!/guide/Titanium_Command-Line_Interface_Reference) CLI 3.2+ command and stand-alone CLI for managing your app's internationalization. It replaces the soon to be deprecated `alloy extract-i18n` and works on both [Alloy](http://docs.appcelerator.com/titanium/latest/#!/guide/Alloy_Command-Line_Interface_Reference) and Classic projects.

* Blogs on ti-i18n: [http://fokkezb.nl/tag/ti-i18n](http://fokkezb.nl/tag/ti-i18n)

## 1. Get it [![npm](http://img.shields.io/npm/v/ti-i18n.png)](https://www.npmjs.org/package/ti-i18n)
*ti-i18n* is built on [Node.js](http://nodejs.org/). Once you have Node.js installed you can use the included NPM package manager to install [ti-i18n](https://npmjs.org/package/ti-i18n) via the following command:

```
sudo npm install -g ti-i18n
```

### Optionally plug as Titanium CLI 3.2.0 command
If you already run the upcoming Titanium CLI 3.2.0, you can let *ti-i18n* plug itself as a command under the Titanium CLI:

```
ti-i18n plug
```

Once, you've done this. The following (note the `-`) do exactly the same:

```
ti-i18n extract
ti i18n extract
```

*ti-i18n* will be further developped to be a worthy command, listen to the global flags like `--no-colors` and read any relevant defaults from the CLI config. Use `ti-i18n plugged` and `ti-i18n unplug` to check if *ti-i18n* is plugged or unplug.

### Or use it as a module
You can also use *ti-18n* as an dependency of your NodeJS project. The same options apply, just use the full names and make sure options like `--project-dir` are camel-cased to `projectDir`.

```javascript
var i18n = require('ti-i18n');
i18n.extract({
	language: 'nl',
	apply: true
});
```

## 2. Use it

### Extract
As demonstrated by the test on the files in [test/source](https://github.com/FokkeZB/ti-i18n/tree/master/test/source), *ti-i18n* is able to extract i18n strings from XML, TSS and JS source code. Just don't use composed strings like `L('error_' + code);`.

By default *ti-i18n* scans the `i18n` directory for languages and reads and writes to all of them. You can choose a specific language by passing it as the first argument after the `extract` command.

Use the `-a` or `--apply` flag to actually append the missing strings to the files. In both cases, *ti-i18n* will display a table with the exact changes (to be) made.

```
Usage: extract [options]
Example: ti-i18n extract -a -l nl
Options:
    -a, --apply               append to the strings.xml files (default: no)
    -d, --project-dir <path>  Project directory (default: current)
    -l, --language <ln>       single language to compare with and write to (default: all)
```

### Sync
The sync command makes sure all languages have the same strings. If a file doesn't have a string present in one of the other languages, it will be appended to it.

Use the `-a` or `--apply` flag to actually append the missing strings to the files. In both cases, *ti-i18n* will display a table with the exact changes (to be) made.

```
Usage: sync [options]
Example: ti-i18n sync -a
Options:
    -a, --apply               append to the strings.xml files (default: no)
    -d, --project-dir <path>  Project directory (default: current)
```

### Merge
Once you've had the strings [translated](http://translate.google.com/toolkit/), you can merge the translated XML with the one in your project. Existing string values will be updated and new strings added but if during translation your strings.xml file has grown, the new ones will be preserved.

```
Usage: merge [options]
Example: ti-i18n merge -s ~/translated.xml -l nl -a
    -a, --apply               overwrite the strings.xml file (default: no)
    -d, --project-dir <path>  Project directory (default: current)
    -s, --source <path>       Source strings.xml file to merge from
    -l, --language <ln>       language to compare with and merge to
```

## Global options
Option | Availability | Description
------- | ----------- | -----------
`-h`, `--help`|both|output usage information
`-v`, `--version`|stand-alone|output the version number (as a hook, this will output the Titanium CLI version)

## Testing
The [test](https://github.com/FokkeZB/ti-i18n/tree/master/test) folder contains a single unit-test you can use, e.g. with mocha:

```
sudo npm install -g mocha
mocha test/test.js
```

## Roadmap

* ~~Rewrite `extract` to search through `XML`, `TSS` (JSON) and `JS` (AST).~~
* Option to remove second hint-argument from `L` and use it in `strings.xml`.
* Add `validate` to validate `strings.xml` for UTF-8, CDATA, duplicates etc.
* Add `clean` to comment out any strings not found in source.
* ~~Add `merge` to merge translated file back into project.~~
* ~~Add `peer` to make sure all language have same strings.~~
* Add `name` to create/update XML for internationalized app names.

## License

<pre>
Copyright 2013 Fokke Zandbergen

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
</pre>
