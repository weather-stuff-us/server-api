'use strict'

module.exports = {
  forLatLon
}

const urls = require('./lib/urls')
const latLon = require('./lib/lat-lon')
const getJSON = require('../get-json')
const dateNormalize = require('../date-normalize')
const forecastGridData = require('../forecast-grid-data')

async function forLatLon (latArg, lonArg) {
  const { lat, lon } = latLon.normalize({ lat: latArg, lon: lonArg })

  const url = await urls.forecastGridPoints(lat, lon)

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

  result.updated = dateNormalize(properties.updateTime)
  result.location = `${lat},${lon}`
  result.times = forecastGridData.transform(properties)

  return result
}
