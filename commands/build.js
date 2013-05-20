var exec = require('child_process').exec,
    path = require('path'),
    fs = require('fs'),
    async = require('async'),
    rimraf = require('rimraf'),
    objects = [],
    includes = [];


var compile = function(source, config, fn) {
  var out = path.join(process.cwd(), 'build', source.replace('deps/','').replace('/', '-').replace('.c', '.o'));
  console.log('  ' + source.replace(process.cwd(), '').replace('deps/',''));

  var gcc = [
    'avr-gcc',
    '-c',
    path.join(process.cwd(), source),
    '-DF_CPU=' + config.hertz,
    '-mmcu=' + config.device,
    '-o',
    out,
    '-I' + path.join(process.cwd(), 'deps')
  ].concat(config.cflags);

  exec(gcc.join(' '), fn);

  objects.push(out);
}


module.exports = function(argv, config, finalCallback) {


  var avrPath = path.join(process.cwd(), 'avr.json');

  try {
    fs.statSync(avrPath)
  } catch (e) {
    console.log('could not find avr.conf');
    return;
  }

  rimraf.sync(path.join(process.cwd(), 'build'));
  fs.mkdirSync(path.join(process.cwd(), 'build'));

  objects = [];


  var avr = JSON.parse(fs.readFileSync(avrPath).toString());

  var sources = avr.sources;

  sources.push(avr.main);

  // TODO: collect dependency files
  try {
    var depsDir = path.join(process.cwd(), 'deps');
    fs.statSync(depsDir);
    fs.readdirSync(depsDir).forEach(function(dep) {

      var depDir = path.join(depsDir, dep);
      var depDef = JSON.parse(fs.readFileSync(path.join(depDir, 'avr.json')).toString());

      depDef.sources.forEach(function(source) {
        sources.push(path.join('deps', dep, source));
      });
    });

  } catch (e) {}

  console.log('COMPILING');
  async.eachLimit(sources, require('os').cpus().length, function(source, fn) {
    compile(source, avr, fn);
  }, function(err) {
    if (err) {
      throw err;
    }

    console.log('LINKING')
    exec('avr-gcc -o build/main.elf ' + objects.join(' '), function(err) {
      if (err) {
        throw err;
      }

      async.eachSeries([
        'avr-objcopy -j .text -j .data -O ihex build/main.elf build/main.hex',
        'avr-size --format=avr --mcu=$(DEVICE) build/main.elf',
      ], exec, function(err) {
        if (err) {
          throw err;
        }

        finalCallback && finalCallback();
      });
    });
  });
}
