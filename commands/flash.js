var spawn = require('child_process').spawn,
    path = require('path'),
    fs = require('fs');

module.exports = function(argv, config) {
  var avrPath = path.join(process.cwd(), 'avr.json');
  var avr = JSON.parse(fs.readFileSync(avrPath).toString());


  this.build(argv, config, function() {
    console.log('FLASHING');
    spawn(
      'avrdude',
      avr.programmer.split(' ')
        .concat(['-U', 'flash:w:build/main.hex:i', '-v', '-v']),
      { stdio: 'inherit' }
    );
  });

};