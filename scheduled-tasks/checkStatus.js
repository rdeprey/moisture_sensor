const schedule = require('node-schedule');
const MoistureLevel = require('../controllers/moistureLevel');

const shouldWaterPlant = () => {
    // Run every day at 7 a.m.
    return schedule.scheduleJob('0 7 * * *', async () => {
        // Check the soil dryness level
        const moistureReading = await MoistureLevel.getMoistureLevel();
        const moistureLevel = moistureReading.soilDrynessPercentage;

        // See if the soil dryness indicates that the plant needs watering
        const shouldWater = MoistureLevel.shouldWater(moistureLevel);

        if (shouldWater) {
            // Water the plant for three seconds
            setTimeout(() => {
                MoistureLevel.waterThePlant();

                setTimeout(() => {
                    MoistureLevel.stopWateringPlant();
                }, 2000);
            }, 2000);
        }
    });
};

module.exports = {
    shouldWaterPlant,
};