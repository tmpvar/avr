#!/usr/bin/env node
var commands = require('../commands'),
    argv = require('optimist').argv,
    path = require('path'),
    fs = require('fs'),
    confPath = path.join(process.env.HOME, '.avrconf'),
    config = {};

  try {
    fs.statSync(confPath);
    config = JSON.parse(fs.readFileSync(confPath).toString());
  } catch (e) {}

var command = argv._[0];

if (!argv._.length || !commands[command]) {
  console.log([
    'USAGE: avr <command>',
    '',
    'commands:',
    ' * init',
    '   avr init <path/to/project> - create a new project',
    '   avr init - setup CWD as the new project',
    '',
    ' * install',
    '   avr install <../path/to/library> - install from local filesystem',
    '   avr install <user>/<project>[@tag] - install from github',
    '',
    ' * delete - remove dep',
    '',
    ' * build',
    '',
    ' * flash',
    ''
  ].join('\n') + '\n');
  return;
}

function run(file) {
  if (!file || file.match(/\.h|\.c/)) {
    commands[command].call(commands, argv, config);
  }
}

if (argv.w) {
  var watcher = require('hound').watch(process.cwd());
  watcher.on('create', run);
  watcher.on('delete', run);
  watcher.on('change', run);

  process.on('uncaughtException', function(e) {
    console.log(e);
  });
}
run();
