'use strict'

module.exports = handler

const logger = require('../logger').create(__filename)

const weatherAPI = require('../weather-api')

async function handler (req, res, next) {
  const location = req.query.location
  if (location == null) {
    return res.status(400).send({ error: `query param location not provided` })
  }

  const [lat, lon] = location.split(',')
  if (lat == null) {
    return res.status(400).send({ error: `query param location did not include a latitude` })
  }
  if (lon == null) {
    return res.status(400).send({ error: `query param location did not include a longitude` })
  }

  try {
    var result = await weatherAPI.forecastTimeSeries(lat, lon)
  } catch (err) {
    if (err.invalidValue) return res.status(400).send({ error: err.message })

    logger.error(`error getting forecast time series: ${err.message}`)
    return res.status(500).send({ error: `server error` })
  }

  res.send(result)
}
