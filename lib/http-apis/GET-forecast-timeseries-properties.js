'use strict'

module.exports = handler

const weatherAPI = require('../weather-api')

async function handler (req, res, next) {
  res.send(weatherAPI.forecastTimeSeriesProperties())
}
