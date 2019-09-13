// Runs continuously on the Pi, but doesn't write anything to the database
// Setup the LCD panel
//var LCDPLATE, lcd;
//LCDPLATE = require('adafruit-i2c-lcd').plate;
//lcd = new LCDPLATE(1, 0x20);

// Setup the sensor input
const mcpadc = require('mcp-spi-adc');

const moistureSensor = mcpadc.open(5, {speedHz: 20000}, (err) => {
  if (err) throw err;

//  setInterval(() => {
    moistureSensor.read((err, reading) => {
      if (err) throw err;
      
     while(true) {
  //    lcd.clear();

      let value = reading.value.toFixed(2);

  //    if (value >= 0.75) {
  //      lcd.backlight(lcd.colors.GREEN);
//	lcd.message("Happy: " + value.toString());
  //    } else if (value >= 0.4 && value < 0.75) {
//	lcd.backlight(lcd.colors.YELLOW);
//	lcd.message("Okayish: " + value.toString());
  //    } else {
    //    lcd.backlight(lcd.colors.RED);
//	lcd.message("Thirsty: " + value.toString());
  //    }

      console.log(value);
     }
   });
 // }, 5000);
});
