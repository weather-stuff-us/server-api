'use strict'

module.exports = handler

const logger = require('../logger').create(__filename)

const weatherAPI = require('../weather-api')
const locationParms = require('./lib/location-parms')

async function handler (req, res, next) {
  const location = locationParms(req, res)
  if (location == null) return

  const [lat, lon] = location

  try {
    var result = await weatherAPI.locationInfo(lat, lon)
  } catch (err) {
    if (err.invalidInputValue) return res.status(400).send({ error: err.message })

    logger.error(`error getting forecast time series: ${err.message}`)
    return res.status(500).send({ error: `server error` })
  }

  res.send(result)
}
