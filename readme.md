# avr

avr project tools

This module allows you to mix and match components for avr embedded development.  You can either pull from github or a local directory and there is no need to modify a makefile.

## install

Make sure you have `avrdude`, `avr-gcc` and friends installed.  On osx you can do that by installing [CrossPack](http://www.obdev.at/avrmacpack/) or using brew/macports

`npm install -g avr`

## use

`avr <command> <subcommands>`

### commands

#### init [path/to/project]

initialize the current directory as a new project or create the specified directory and initialize there

#### build

calls out to `avr-gcc` and compiles/links the sources specified in the `avr.json` file

`sources` found in `deps/*/avr.json` are also compiled and the resulting artifacts are put in `./build/`

#### flash

performs a `build` and invokes `avrdude` based on the settings in `avr.conf`

#### install [../path/to/project | githubuser/project]

puts a local copy of `project` into your `./deps/` directory

#### delete [project]

removes the local copy of project from `./deps/`


## license

MIT