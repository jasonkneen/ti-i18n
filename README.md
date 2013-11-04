# Titanium i18n

Titanium i18n (*ti-i18n*) is both a [Titanium](http://docs.appcelerator.com/titanium/latest/#!/guide/Titanium_Command-Line_Interface_Reference) CLI 3.2+ hook and stand-alone CLI for managing your app's internationalization. For now, it does exactly what the soon to be deprecated `alloy extract-i18n` does. But this will soon be expanded with new options, for both [Alloy](http://docs.appcelerator.com/titanium/latest/#!/guide/Alloy_Command-Line_Interface_Reference) and Classic projects.

* NPM: [https://npmjs.org/package/ti-i18n](https://npmjs.org/package/ti-i18n)

## Quick Start

### Install from NPM
*ti-i18n* is built on [Node.js](http://nodejs.org/). Once you have Node.js installed you can use the included NPM package manager to install [ti-i18n](https://npmjs.org/package/ti-i18n) via the following command:

```
sudo npm install -g ti-i18n
```

### Install as Titanium CLI 3.2+ hook
If you already run the upcoming Titanium CLI 3.2, you can ask *ti-i18n* to install itself as an hook under the Titanium CLI:

```
ti-i18n hook
```

Once, you've done this. The following (note the `-`) does exactly the same:

```
ti-i18n extract

ti i18n extract
```

*ti-i18n* will be further developped to be a worthy hook, listen to the global flags like `--no-colors` and read any relevant defaults from the CLI config.

### Extract some strings
The default *ti-i18n* assumes english as language and doesn't write back any changes to the `strings.xml`. You can change language by passing it as the first argument after the `extract` command. Add the `-a` or `--apply` option to write back:

```
ti-i18n extract nl -a
```

## Usage
Command | Availability | Option | Description
------- | ------------ | ------ | -----------
`extract`|both||extract i18n strings from the source code (js and tss files)
||`<language>`|Language to read and write `strings.xml` from
||`-a`, `--apply`|Update `strings.xml`
`hook`|stand-alone|hook ti-i18n into Titanium CLI as: `ti i18n`
`unhook`|both|unhook ti-i18n from Titanium CLI
`hooked`|stand-alone|check if ti-i18n is hooked into Titanium CLI

## Global options
Option | Availability | Description
------- | ----------- | -----------
`-h`, `--help`|both|output usage information
`-v`, `--version`|stand-alone|output the version number (as a hook, this will output the Titanium CLI version)

### System arguments
Some arguments have to do with how TiNy works:

Argument(s) | Description
----------- | -----------
`v`, `version`, `-v` | Prints TiNy version. Must be first argument.
`recipes` | Prints system and user(overridden) recipes. Must be first argument.
`verbose` | Shows how recipes are expanded, shows the resulting command and asks if you want to execute it, save it as recipe or just exit.
`[my-recipe]:` | Sets or unsets an recipe. See [Recipes](#recipes).
`[new-recipe]:[old-recipe]` | Renames a recipe. See [Recipes](#recipes).

## Roadmap

* Rewrite `extract` to search through `XML`, `TSS` (JSON) and `JS` (AST).
* Option to remove second hint-argument from `L` and use it in `strings.xml`.
* Add `validate` to validate `strings.xml` for UTF-8, CDATA, duplicates etc.
* Add `clean` to comment out any strings not found in source.
* Add `peer` to make sure all language have same strings.
* Add `name` to create/update XML for internationalized app names.

## Thanks to

* [Chris Barber](https://twitter.com/cb1kenobi) for the awesome CLI hooks in 3.2
* Coffee

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
