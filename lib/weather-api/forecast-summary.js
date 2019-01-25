'use strict'

module.exports = {
  forLatLon
}

const urls = require('./lib/urls')
const latLon = require('./lib/lat-lon')
const getJSON = require('../get-json')
const dateNormalize = require('../date-normalize')
const dateLocalize = require('../date-localize')
const LocationInfo = require('./location-info')

async function forLatLon (latArg, lonArg) {
  const { lat, lon } = latLon.normalize({ lat: latArg, lon: lonArg })

  const locationInfo = await LocationInfo.forLatLon(lat, lon)
  if (locationInfo == null) throw new Error(`no location info available`)

  const timeZone = locationInfo.timeZone

  const url = await urls.forecastSummary(lat, lon)

  try {
    var data = await getJSON(url)
  } catch (err) {
    throw new Error(`error getting forecast summary: ${err.message}`)
  }

  if (data == null) throw new Error(`no data returned for forecast summary`)
  if (data.properties == null) throw new Error(`no data properties returned for forecast summary`)

  return buildResult(lat, lon, data.properties, timeZone)
}

function buildResult (lat, lon, properties, timeZone) {
  const result = {}

  result.updated = dateNormalize(properties.updated)
  result.location = `${lat},${lon}`
  const periods = properties.periods || []
  result.periods = periods.map(period => {
    const startTime = dateLocalize(period.startTime, timeZone)
    const endTime = dateLocalize(period.endTime, timeZone)

    delete period.number

    return Object.assign({}, period, { startTime, endTime })
  })

  return result
}
