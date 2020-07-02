const schedule = require('node-schedule');
const MoistureLevel = require('../controllers/moistureLevel');
const Database = require('../controllers/database');

const shouldWaterPlant = () => {
    // Run every day at 7 a.m.
    return schedule.scheduleJob('0 7 * * *', async () => {
        // Check the soil dryness level
        const moistureReading = await MoistureLevel.getMoistureLevel();
        const moistureLevel = moistureReading.soilDrynessPercentage;

        Database.addRecord('moisture-levels', {
	    soilDrynessPercentage: moistureLevel
	}); 
    });
};

module.exports = {
    shouldWaterPlant,
};
