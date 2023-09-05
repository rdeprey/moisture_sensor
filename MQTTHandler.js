const mqtt = require('mqtt');

class MqttHandler {
  constructor() {
    this.mqttClient = null;
    this.host = 'ws://192.168.1.176:9001/mqtt';
  }
  
  connect() {
    // Connect mqtt with credentials (in case of needed, otherwise we can omit 2nd param)
    this.mqttClient = mqtt.connect(this.host);

    // Mqtt error calback
    this.mqttClient.on('error', (err) => {
      console.log(err);
      this.mqttClient.end();
    });

    // Connection callback
    this.mqttClient.on('connect', () => {
      console.log(`mqtt client connected`);
    });

    this.mqttClient.on('close', () => {
      console.log(`mqtt client disconnected`);
    });
  }

  // Sends a mqtt message to topic: mytopic
  sendMoistureLevelMessage(message) {
    this.mqttClient.publish('/plantSoilMoistureLevel', message);
  }

  sendTempHumidityMessage(message) {
    this.mqttClient.publish('/tempAndHumidity', message);
  }
}

module.exports = MqttHandler;
