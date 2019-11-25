const express = require('express');
const router = express.Router();
const MoistureSensor = require('../controllers/moistureLevel');
const TempAndHumidity = require('../controllers/tempAndHumidity');
const Database = require('../controllers/database');

/* GET requests */
router.get('/get-moisture-level', function(req, res, next) {
  MoistureSensor.getMoistureLevel()
    .then(data => {
      res.json({ 'reading': data });
    }).catch(error => {
      res.status(500).send(`There was an error: ${error}`);
    });
});

router.get('/get-temp-humidity', function(req, res, next) {
  TempAndHumidity.getTemperatureAndHumidity()
    .then(data => {
      res.json(data);
    }).catch(error => {
      res.status(500).send(`There was an error: ${error}`);
    });
});

router.get('/get-last-watering-data', function(req, res, next) {
  Database.getLastWateringData()
    .then(async data => {
      const theResp = await data;
      res.json(theResp);
    }).catch(error => {
      res.status(500).send({
        errorMessage: `There was an error: ${error}`
      });
    });
});

router.get('/get-watering-status', function(req, res, next) {
  MoistureSensor.getWateringStatus()
    .then(response => {
      res.json(response);
    }).catch(error => {
      res.status(500).send(error);
    });
});

/* POST requests */
router.post('/water-the-plant', function(req, res, next) {
  MoistureSensor.waterThePlant()
    .then(response => {
      res.json(response);
    }).catch(error => {
      res.status(500).send(error);
    });
});

router.post('/stop-watering-plant', function(req, res, next) {
  MoistureSensor.stopWateringPlant()
    .then(response => {
      res.json(response);
    }).catch(error => {
      res.status(500).send(error);
    });
});

router.post('/google-needs-watering', function(req, res, next) {
  MoistureSensor.tellGoogleIfWateringIsNeeded()
    .then(decision => {
      res.json(decision);
    }).catch(error => {
      res.status(500).send(`I'm sorry, but I was unable to get a response at this time.`);
    });
})

module.exports = router;
