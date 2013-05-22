var child_process = require('child_process'),
    exec = child_process.exec,
    path = require('path'),
    fs = require('fs'),
    async = require('async'),
    rimraf = require('rimraf'),
    buildDir = path.join(process.cwd(), 'build'),
    objects = [],
    includes = [],
    verbose;

var gcc = function(config, extend) {
  return [
    'avr-gcc',
    '-DF_CPU=' + config.hertz,
    '-mmcu=' + config.device,
  ].concat(extend)
}

var compile = function(source, config, fn) {
  var out = path.join(process.cwd(), 'build', source.replace('deps/','').replace('/', '-').replace('.c', '.o'));
  console.log('  ' + source.replace(process.cwd(), '').replace('deps/',''));

  var s = gcc(config, [
    '-c',
    path.join(process.cwd(), source),
     '-o',
    out,
    '-I' + path.join(process.cwd(), 'deps')
  ]).concat(config.cflags).join(' ');

  if (verbose) {
    console.log(s);
  }

  exec(s, fn);

  objects.push(out);
}


module.exports = function(argv, config, finalCallback) {
  verbose = !!argv.v;

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

    var s = gcc(avr, [
      '-o ' + path.join(buildDir, 'main.elf'),
    ].concat(objects)).join(' ');

    if (verbose) {
      console.log(s);
    }

    exec(s, function(err) {
      if (err) {
        throw err;
      }

      async.eachSeries([
        'avr-objcopy -j .text -j .data -O ihex ' + path.join(buildDir, 'main.elf') + ' ' + path.join(buildDir, 'main.hex'),
        'avr-size --format=avr --mcu=' + avr.device + ' ' + path.join(buildDir, 'main.elf'),
      ], function(line, fn) {
        exec(line, function(err, so, se) {
          console.log(so);
          fn(err);
        });
      }, function(err) {
        if (err) {
          throw err;
        }

        finalCallback && finalCallback();
      });
    });
  });
}
