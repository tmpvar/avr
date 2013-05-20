var path = require('path'),
    fs = require('fs'),
    request = require('request'),
    rimraf = require('rimraf'),
    cpr = require('cpr').cpr,
    zlib = require('zlib'),
    tar = require('tar');

module.exports = function(argv, config) {

  var avrPath = path.join(process.cwd(), 'avr.json');
  var avr = require(avrPath);
  var depsDir = path.join(process.cwd(), 'deps');


  try {
    fs.statSync(depsDir);
  } catch (e) {
    fs.mkdirSync(depsDir);
  }

  var r = argv._[1];
  var name = path.basename(r);
  var t = path.join(depsDir, name);


  if (!r) { return console.log('nothing to do'); }

  try {
    rimraf.sync(t);
  } catch (e) {}


  // Github repo
  var matches = r.match(/^([a-z0-9_\-]+\/[a-z0-9_\-]+)@?(.+)?/)
  if (matches) {
    var at = (matches[2] || 'master');
    var target = path.join(
      depsDir,
      name + '-' + (matches[2] || 'master')
    );

    var url = 'https://github.com/' + matches[1] + '/archive/';
    url += at + '.tar.gz'

    request(url)
      .pipe(zlib.createGunzip())
      .pipe(tar.Extract({ path : depsDir }))
      .on('end', function() {
        fs.renameSync(
          target,
          path.join(depsDir, path.basename(matches[1]))
        );

      });

  // Local Dir
  } else {
    cpr(path.resolve(process.cwd(), r), t, {
      overwrite: true,
      confirm: true
    }, function(e) {
      if (e) {
        throw e;
      }

      try {
        rimraf.sync(path.join(t, '.git'))
      } catch (e) {}

    });
  }

};