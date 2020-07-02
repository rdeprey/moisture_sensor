const schedule = require('node-schedule');
const MoistureLevel = require('../controllers/moistureLevel');
const mqttHandler = require('../MQTTHandler');

const mqttClient = new mqttHandler();
mqttClient.connect();

const updateMqtt = () => {
    // Run every 10 minutes
    return schedule.scheduleJob('*/10 * * * *', async () => {
        // Check the soil dryness level
        const data = await MoistureLevel.getMoistureLevel();

	// Update MQTT
	mqttClient.sendMessage(`fig-tree: ${data.soilDrynessPercentage}`);
    });
};

module.exports = {
    updateMqtt
}
