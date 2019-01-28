'use strict'

module.exports = {
  forLatLon
}

const urls = require('./lib/urls')
const getJSON = require('../get-json')
const LocationInfo = require('../location-info')
const dateNormalize = require('../date-normalize')
const forecastData = require('./lib/forecast-data')

async function forLatLon (lat, lon) {
  const locationInfo = await LocationInfo.forLatLon(lat, lon)
  if (locationInfo == null) throw new Error(`no location info available`)

  const url = await urls.forecastGridPoints(locationInfo.lat, locationInfo.lon)

  try {
    var data = await getJSON(url)
  } catch (err) {
    throw new Error(`error getting forecast summary: ${err.message}`)
  }

  if (data == null) throw new Error(`no data returned for forecast summary`)
  if (data.properties == null) throw new Error(`no data properties returned for forecast summary`)

  return buildResult(data.properties, locationInfo)
}

function buildResult (properties, locationInfo) {
  const result = {}

  const transformed = forecastData.transform(properties, locationInfo.timeZone)

  result.updated = dateNormalize(properties.updateTime)
  result.location = locationInfo

  Object.assign(result, transformed)

  return result
}

// cli tester
if (require.main === module) main()

async function main () {
  const result = await forLatLon(35.70539, -78.7963)
  console.log(JSON.stringify(result, null, 4))
}
