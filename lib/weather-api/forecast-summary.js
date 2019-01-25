'use strict'

module.exports = {
  forLatLon
}

const urls = require('./lib/urls')
const latLon = require('./lib/lat-lon')
const getJSON = require('../get-json')
const dateNormalize = require('../date-normalize')
const dateLocalize = require('../date-localize')
console.log(__filename, dateLocalize.name)

async function forLatLon (latArg, lonArg) {
  const { lat, lon } = latLon.normalize({ lat: latArg, lon: lonArg })

  const url = await urls.forecastSummary(lat, lon)

  try {
    var data = await getJSON(url)
  } catch (err) {
    throw new Error(`error getting forecast summary: ${err.message}`)
  }

  if (data == null) throw new Error(`no data returned for forecast summary`)
  if (data.properties == null) throw new Error(`no data properties returned for forecast summary`)

  return buildResult(lat, lon, data.properties)
}

function buildResult (lat, lon, properties) {
  const result = {}

  result.updated = dateNormalize(properties.updated)
  result.location = `${lat},${lon}`
  const periods = properties.periods || []
  result.periods = periods.map(period => {
    const sTime = dateNormalize(period.startTime)
    const eTime = dateNormalize(period.endTime)

    delete period.number
    delete period.startTime
    delete period.endTime

    return Object.assign({ sTime, eTime }, period)
  })

  return result
}
