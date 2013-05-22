var spawn = require('child_process').spawn,
    path = require('path'),
    fs = require('fs');

module.exports = function(argv, config) {
  var avrPath = path.join(process.cwd(), 'avr.json');
  var avr = JSON.parse(fs.readFileSync(avrPath).toString());


  this.build(argv, config, function() {
    console.log('FLASHING');

    var args = avr.programmer.split(' ').concat([
      '-U',
      'flash:w:' + path.join(process.cwd(), 'build', 'main.hex') + ':i'
    ]);

    if (argv.v) {
      args.push('-v');
      args.push('-v');
    }

    spawn(
      'avrdude',
      args,
      { stdio: 'inherit' }
    );
  });

};