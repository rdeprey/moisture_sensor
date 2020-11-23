// Setup the sensor input
const mcpadc = require('mcp-spi-adc');
const Database = require('./database');
const i2c = require('i2c-bus');

// Relay pinouts: https://wiki.52pi.com/index.php/DockerPi_4_Channel_Relay_SKU:_EP-0099
const relayAddress = 0x10;

const completelyWet = 395;
const completelyDry = 780;
const valueRange = completelyDry - completelyWet;

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

            let iterator = 100; // Just need a large number of readings to try for better accuracy

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
                const averageRawValue = readings.rawValues.reduce((a, b) => a + b, 0) / 100;
                const averageValue = readings.values.reduce((a, b) => a + b, 0) / 100;
    
                // Set the value to a percentage based on the max reading
                return resolve({
                    rawValue: averageRawValue,
                    value: averageValue,
                    completelyWetValue: completelyWet,
                    completelyDryValue: completelyDry,
                    soilDrynessPercentage: averageRawValue > 0 ? (((averageRawValue - valueRange) / valueRange) * 100).toFixed(0) : 0,
                });
            });
        });
    });
};

const shouldWater = (moistureLevel) => {
    if (moistureLevel <= 55) {
        return true;
    }

    return false;
};

const getWateringStatus = () => {
    return new Promise((resolve, reject) => {
        const pumpRelay = i2c.open(1, err => {
            if (err) {
                return reject(new Error(`There was an error opening the pump relay: ${err}`));
            }
        
            pumpRelay.readWord(relayAddress, 0x01, (err, rawData) => {
                if (err) {
                    return reject(new Error(`There was an error getting the pump relay status: ${err}`));
                }

                return resolve({
                    status: rawData > 0 ? 'WATERING' : 'NOT WATERING',
                });
            });
        });
    });
};

const waterThePlant = () => {
    return new Promise((resolve, reject) => {
        const pumpRelay = i2c.open(1, err => {
            if (err) {
                return reject(new Error(`There was an error opening the pump relay: ${err}`));
            }
        
            pumpRelay.readWord(relayAddress, 0x01, async (err, rawData) => {
                if (err) {
                    return reject(new Error(`There was an error getting the pump relay status: ${err}`));
                }

                const moistureLevel = await getMoistureLevel();
                const needsWater = shouldWater(moistureLevel.soilDrynessPercentage);
            
                if (rawData === 0 && needsWater) {
                    // closes the circuit and starts the pump
                    pumpRelay.writeWord(relayAddress, 0x01, 0xFF, (err, data) => {
                        if (err) {
                            return reject(new Error(`There was an error starting the pump relay: ${err}`));
                        }

                        Database.addRecord('wateringSchedule', {
                            soilDrynessPercentage: moistureLevel.soilDrynessPercentage
                        });
                    });

                    return resolve({
                        status: `The plant is being watered.`,
                    });
                }

                return resolve({
                    status: `The plant doesn't need watering.`,
                });
            });
        });
    });
};

const stopWateringPlant = () => {
    return new Promise((resolve, reject) => {
        const pumpRelay = i2c.open(1, err => {
            if (err) {
                return reject(new Error(`There was an error opening the pump relay: ${err}`));
            }
        
            pumpRelay.readWord(relayAddress, 0x01, (err, rawData) => {
                if (err) {
                    return reject(new Error(`There was an error getting the pump relay status: ${err}`));
                }
            
                if (rawData > 0) {
                    pumpRelay.writeWord(relayAddress, 0x01, 0x00, (err, data) => {
                        if (err) {
                            return reject(new Error(`There was an error stopping the pump relay: ${err}`));
                        }
                    });
                }

                return resolve({
                    status: `The plant is not being watered.`,
                });
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