// Firebase Firestore DB reference
let dbRef = updateDatabase();

// Setup the LCD panel
var LCDPLATE, lcd;
LCDPLATE = require('adafruit-i2c-lcd').plate;
lcd = new LCDPLATE(1, 0x20);

// Setup the sensor input
const mcpadc = require('mcp-spi-adc');

let value = (-1).toFixed(2);

const moistureSensor = mcpadc.open(5, {speedHz: 20000}, (err) => {
  if (err) throw err;

  const getReading = function() {
    return moistureSensor.read((err, reading) => {
      if (err) throw err;

      if (value !== reading.value.toFixed(2)) {
        value = reading.value.toFixed(2);

        lcd.clear();

        if (value >= 0.75) {
          lcd.backlight(lcd.colors.GREEN);
	  lcd.message("Happy: " + value.toString());
        } else if (value >= 0.4 && value < 0.75) {
	  lcd.backlight(lcd.colors.YELLOW);
	  lcd.message("Okayish: " + value.toString());
        } else {
          lcd.backlight(lcd.colors.RED);
  	  lcd.message("Thirsty: " + value.toString());
        }

        // Store the value in a Firebase Firestore database
        let docDate = new Date();
        let docRef = dbRef.collection('moisture-levels').doc(docDate.toString());

        let addData = docRef.set({
	  "level": value
        }).then(ref => {
	  console.log('Added document with ID: ', ref);
        });

	return value;
      }
   });
  };

  getReading();
  setInterval(getReading, 3600000);
});

function updateDatabase() {
  const admin = require('firebase-admin');

  let serviceAccount = require('./serviceAccountKey.json');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  return admin.firestore();
};
