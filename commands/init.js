var path = require('path'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    exec = require('child_process').exec;

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
'int main(void) {',
'',
'  return 0;',
'}',
''
].join('\n')

var gitignore = [
  '.DS_Store',
  'build'
].join('\n');


module.exports = function(argv, config) {

  var projectDir = path.resolve(process.cwd(), argv._[1]);
  json.name = path.basename(projectDir);

  try {
    fs.statSync(projectDir);
  } catch (e) {
    mkdirp.sync(projectDir);
  }

  fs.writeFileSync(path.join(projectDir, 'main.c'), main);
  fs.writeFileSync(path.join(projectDir, '.gitignore'), gitignore);
  fs.writeFileSync(path.join(projectDir, 'readme.md'), '# ' + json.name + '\n');

  fs.writeFileSync(
    path.join(projectDir, 'avr.json'),
    JSON.stringify(json, null, '  ')
  );

  exec(
    'git init . && git add . && git commit -m "initial"',
    { cwd : projectDir },
    function(err) {
      if (err) {
        console.log(arguments);
        throw err;
      }
    }
  );
}
