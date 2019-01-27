'use strict'

module.exports = {
  forLatLon
}

const urls = require('./lib/urls')
const latLon = require('./lib/lat-lon')
const getJSON = require('../get-json')
const LocationInfo = require('./location-info')
const dateNormalize = require('../date-normalize')
const gridData = require('../grid-data')

async function forLatLon (latArg, lonArg) {
  const { lat, lon } = latLon.normalize({ lat: latArg, lon: lonArg })

  const locationInfo = await LocationInfo.forLatLon(lat, lon)
  if (locationInfo == null) throw new Error(`no location info available`)

  const url = await urls.forecastGridPoints(lat, lon)

  try {
    var data = await getJSON(url)
  } catch (err) {
    throw new Error(`error getting forecast summary: ${err.message}`)
  }

  if (data == null) throw new Error(`no data returned for forecast summary`)
  if (data.properties == null) throw new Error(`no data properties returned for forecast summary`)

  return buildResult(data.properties, locationInfo, lat, lon)
}

function buildResult (properties, locationInfo, lat, lon) {
  const result = {}

  result.updated = dateNormalize(properties.updateTime)
  result.location = locationInfo

  result.dates = gridData.transform(properties, locationInfo.timeZone)

  return result
}

// cli tester
if (require.main === module) main()

async function main () {
  const result = await forLatLon(35.70539, -78.7963)
  console.log(JSON.stringify(result, null, 4))
}
