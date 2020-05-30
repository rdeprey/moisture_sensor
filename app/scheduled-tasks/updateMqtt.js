const schedule = require('node-schedule');
const MoistureLevel = require('../controllers/moistureLevel');

const updateMqtt = () => {
    // Run every 10 minutes
    return schedule.scheduleJob('*/10 * * * *', async () => {
        // Check the soil dryness level
        await MoistureLevel.getMoistureLevel();
    });
};

module.exports = {
    updateMqtt
}
