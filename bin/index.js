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
    '   avr install <user>/<project>[@rev|tag] - install from github',
    '',
    ' * build - as setup in makefile',
    '',
    ' * flash - as setup in makefile',
    ''
  ].join('\n') + '\n');
  return;
}

commands[command](argv, config);