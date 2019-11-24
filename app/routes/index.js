const express = require('express');
const router = express.Router();
const MoistureSensor = require('../controllers/moistureLevel');

/* GET home page. */
router.get('/get-moisture-level', function(req, res, next) {
  MoistureSensor.getMoistureLevel()
    .then(data => {
      res.json({ 'reading': data });
    }).catch(error => {
      res.status(500).send(`There was an error: ${error}`);
    })
});

module.exports = router;
