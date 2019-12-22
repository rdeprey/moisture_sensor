// Setup the sensor input
const mcpadc = require('mcp-spi-adc');
const Gpio = require('onoff').Gpio;
const Database = require('./database');

const completelyWet = 395;
const completelyDry = 780;
const pumpRelay = new Gpio(17, 'high'); // IMPORTANT: Use 'high' if relay uses low level trigger

const getSensorReadings = sensor => {
    return new Promise((resolve, reject) => {
        sensor.read((readError, reading) => {
            if (readError) {
                return reject(new Error(`There was an error getting the sensor reading:
                    ${readError}`));
            }

            return resolve(reading);
        });
    });
};

const getMoistureLevel = () => {
    const readingPromises = [];
    let readings = {};
    readings.rawValues = [];
    readings.values = [];

    return new Promise((resolve, reject) => {
        const sensor = mcpadc.open(5, {speedHz: 20000}, (error) => {
            if (error) {
                return reject(new Error(`There was an error accessing the sensor: ${error}`));
            }

            let iterator = 50; // Just need a large number of readings to try for better accuracy

            while (iterator >= 0) {
                readingPromises.push(getSensorReadings(sensor)
                    .then(reading => {
                        readings.rawValues.push(reading.rawValue);
                        readings.values.push(reading.value);
                    }).catch(error => {
                        return reject(error);
                    })
                );

                iterator--;
            }

            return Promise.all(readingPromises).then(() => {
                const averageRawValue = readings.rawValues.reduce((a, b) => a + b, 0) / 50;
                const averageValue = readings.values.reduce((a, b) => a + b, 0) / 50;
    
                // Set the value to a percentage based on the max reading
                return resolve({
                    rawValue: averageRawValue,
                    value: averageValue,
                    completelyWetValue: completelyWet,
                    completelyDryValue: completelyDry,
                    soilDrynessPercentage: averageRawValue > 0 ? ((averageRawValue / completelyWet) * 100).toFixed(0) : 0,
                });
            });
        });
    });
};

const shouldWater = (moistureLevel) => {
    if (moistureLevel <= 45) {
        return true;
    }

    return false;
};

const getWateringStatus = () => {
    return new Promise((resolve, reject) => {
        pumpRelay.read((error, status) => {
            if (error) {
                return reject(new Error(`There was an error getting the pump relay status: ${error}`));
            }

            return resolve({
                status: status === 0 ? 'WATERING' : 'NOT WATERING',
            });
        });
    });
};

const waterThePlant = () => {
    return new Promise((resolve, reject) => {
        pumpRelay.read(async (error, status) => {
            if (error) {
                return reject(new Error(`There was an error getting the pump relay status: ${error}`));
            }

            const moistureLevel = await getMoistureLevel();
            const needsWater = shouldWater(moistureLevel.soilDrynessPercentage);

            if (status !== 0 && needsWater) {
                pumpRelay.writeSync(0); // closes the circuit and starts the pump
                Database.addRecord('wateringSchedule', {
                    soilDrynessPercentage: moistureLevel.soilDrynessPercentage
                });
            }

            return resolve({
                status: `The plant is being watered.`,
            });
        });
    });
};

const stopWateringPlant = () => {
    return new Promise((resolve, reject) => {
        pumpRelay.read((error, status) => {
            if (error) {
                return reject(new Error(`There was an error getting the pump relay status: ${error}`));
            }

            if (status !== 1) {
                pumpRelay.writeSync(1); // opens the circuit and stops the pump
            }

            return resolve({
                status: `The plant is not being watered.`,
            });
        });
    });
};

const tellGoogleIfWateringIsNeeded = () => {
    return getMoistureLevel().then(level => {
        if (level.soilDrynessPercentage < 45) {
            return resolve(`Yes, the plants could use watering. The current moisture level is ${level.soilDrynessPercentage}%.`);
        } else {
            return resolve(`No, the plants are doing well. The current moisture level is ${level.soilDrynessPercentage}%.`);
        }
    }).catch(error => {
        return reject(new Error(error));
    });
};

module.exports = {
    getMoistureLevel,
    shouldWater,
    getWateringStatus,
    waterThePlant,
    stopWateringPlant,
    tellGoogleIfWateringIsNeeded,
};