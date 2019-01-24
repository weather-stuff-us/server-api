'use strict'

module.exports = handler

const forecast = require('../forecast')

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
    var result = await forecast.forLatLon(lat, lon)
  } catch (err) {
    console.log(`error getting forecast: ${err.message}`)
    return res.status(500).send({ error: `server error` })
  }

  res.send(result)
}
