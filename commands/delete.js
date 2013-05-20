var rimraf = require('rimraf'),
    path = require('path'),
    fs = require('fs');

module.exports = function(argv, config) {
  if (!argv._[1]) { return console.log('nothing to do'); }

  rimraf.sync(
    path.join(
      process.cwd(), 'deps', path.basename(argv._[1])
    )
  );
};