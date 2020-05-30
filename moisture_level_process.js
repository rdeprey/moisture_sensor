// Runs continuously on the Pi, but doesn't write anything to the database
// Setup the sensor input
const mcpadc = require('mcp-spi-adc');

const moistureSensor = mcpadc.open(5, {speedHz: 20000}, (err) => {
  if (err) throw err;

  moistureSensor.read((err, reading) => {
    if (err) throw err;
      
     while(true) {
      console.log('reading: ', reading.rawValue);
    }
 });
});
