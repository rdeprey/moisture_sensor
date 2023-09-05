const schedule = require('node-schedule');
const MoistureLevel = require('../controllers/moistureLevel');
const TempHumidity = require('../controllers/tempAndHumidity');
const mqttHandler = require('../MQTTHandler');

const mqttClient = new mqttHandler();
mqttClient.connect();

const updateMqtt = () => {
    // Run every 10 minutes
    const rule = new schedule.RecurrenceRule();
    rule.minute = 10;

    return schedule.scheduleJob('*/10 * * * *', async () => {
        // Check the soil dryness level
        const data = await MoistureLevel.getMoistureLevel();

        // Update MQTT
        mqttClient.sendMoistureLevelMessage(`golden-pathos: ${data.soilDrynessPercentage}`);

        // Get the latest temp and humidity data
        const tempHumidity = await TempHumidity.getTemperatureAndHumidity();

        // Update MQTT
        mqttClient.sendTempHumidityMessage(`temperature: ${tempHumidity.temperature.fahrenheit}, humidity: ${tempHumidity.humidityPercentage}`);
    });
};

module.exports = {
    updateMqtt
}
