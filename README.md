# Moisture Sensor

Automatically water a plant using a Raspberry Pi, a soil moisture sensor, a relay, and a water pump. This codebase:

- Checks the soil moisture sensor once a day using a scheduled task and waters the plant if the soil is too dry. It does this by enabling a relay that turns on a water pump and lets it run for a specified period of time.
- Checks the temperature and humidity levels using sensors attached to the Raspberry Pi.
- Uses MQTT to send soil dryness details over a local network for real-time plant monitoring.
- Stores soil moisture data in a Firebase database so that you can review the data over time

## Configuration

This codebase uses a Firebase Firestore database to store soil moisture data. In order for the code to run, you will need to:

1. [Create a Firebase account](https://firebase.google.com/)
2. [Setup a Firestore database](https://firebase.google.com/docs/firestore)
3. Store the `serviceAccountKey.json` [file for your Firebase account](https://firebase.google.com/docs/admin/setup#initialize_the_sdk_in_non-google_environments) in a `credentials` directory in the project

## Node Version and NVM

The codebase successfully runs on Node 10.19.0. It's possible that it will run on newer versions of Node, but it hasn't been tested.

It's also expected that this code will run on a machine with NVM configured. There is a `.nvmrc` file in the project root that will tell NVM to use the correct Node version when running the code. If you don't want to use NVM, just remove the `.nvmrc` file and remove `. $HOME/.nvm/nvm.sh; nvm use;` from the `start` script in the `package.json` file.

## Hardware Configuration

### Necessary Hardware

The following hardware is needed to run this code:

- A Soil Moisture Sensor (tip: the capacitive sensors last longer than the resistive sensors)
- A DHT11 Temperature and Humidity Sensor
- Relay
- A Raspberry Pi (might not work on a Raspberry Pi Zero due to limited processing power)
- A water pump
- Fish tank tubing
- Power supply

### Sensor Connections

The codebase expects the following hardware configuration for your sensors.

| Sensor                                | Raspberry Pi Pin |
| ------------------------------------- | ---------------- |
| Soil Moisture Sensor                  | Pin 5            |
| DHT11 Temperature and Humidity Sensor | Pin 4            |
| Relay                                 | Address 0x10     |

In order for the soil moisture sensor to work, **you will need to [enable i2c on your Raspberry Pi](https://www.raspberrypi-spy.co.uk/2014/11/enabling-the-i2c-interface-on-the-raspberry-pi/)**.

## MQTT

To use the data sent over MQTT on your local network, you will need to setup an MQTT broker that's subscribed to the following topics:

- `/plantSoilMoistureLevel`
- `/tempAndHumidity`

You can do anything you'd like with this data. For my purposes, I have a React app that displays the data in real-time.
