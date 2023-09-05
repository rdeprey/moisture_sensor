const sensor = require('node-dht-sensor').promises;

const getTemperatureAndHumidity = () => {
    sensor.setMaxRetries(10);
    sensor.initialize(11, 4);
 
    return sensor.read(11, 4)
        .then(res => {
            return {
                temperature: {
                    celsius: res.temperature,
                    fahrenheit: (res.temperature * (9/5))+ 32,
                },
                humidityPercentage: res.humidity,
            };
        }).catch(error => {
            return Promise.reject(new Error(`There was an error accessing the temperature and humidity sensor: ${error}`));
        });
};

module.exports = {
    getTemperatureAndHumidity,
};