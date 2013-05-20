var path = require('path'),
    fs = require('fs'),
    mkdirp = require('mkdirp');

var json = {
  name : "default project name",
  programmer : "",
  device: "atmega328p",
  hertz : 16000000,
  cflags : [
    "-Wall",
    "-Werror",
    "-Os"
  ],
  sources : [],
  deps : [],
  main : "main.c"
}

var main = [
'',
'void main(void) {',
'',
'}',
''
].join('\n')


module.exports = function(argv, config) {

  var projectDir = path.resolve(process.cwd(), argv._[1]);
  json.name = path.basename(projectDir);

  try {
    fs.statSync(projectDir);
  } catch (e) {
    mkdirp.sync(projectDir);
  }

  fs.writeFileSync(path.join(projectDir, 'main.c'), main);

  fs.writeFileSync(
    path.join(projectDir, 'avr.json'),
    JSON.stringify(json, null, '  ')
  );
}
