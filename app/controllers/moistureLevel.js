// Setup the sensor input
const mcpadc = require('mcp-spi-adc');

const completelyWet = 395;
const completelyDry = 780;

const getMoistureLevel = () => {
    return new Promise((resolve, reject) => {
        const sensor = mcpadc.open(5, {speedHz: 20000}, (error) => {
            if (error) {
                return reject(new Error(`There was an error accessing the sensor: ${error}`));
            }

            sensor.read((readError, reading) => {
                if (readError) {
                    return reject(new Error(`There was an error getting the sensor reading:
                        ${readError}`));
                }

                // Set the value to a percentage based on the max reading
                return resolve({
                    rawValue: reading.rawValue,
                    value: reading.value,
                    completelyWetValue: completelyWet,
                    completelyDryValue: completelyDry,
                    soilDrynessPercentage: ((completelyWet / reading.rawValue) * 100).toFixed(0)
                });
            });
        });
    });
};

module.exports = {
    getMoistureLevel,
};