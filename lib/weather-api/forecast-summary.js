'use strict'

module.exports = {
  forLatLon
}

const urls = require('./lib/urls')
const latLon = require('../lat-lon')
const getJSON = require('../get-json')
const dateNormalize = require('../date-normalize')
const TzDateTime = require('../tz-date-time')
const LocationInfo = require('../location-info')

async function forLatLon (latArg, lonArg) {
  const { lat, lon } = latLon.normalize({ lat: latArg, lon: lonArg })

  const locationInfo = await LocationInfo.forLatLon(lat, lon)
  if (locationInfo == null) throw new Error(`no location info available`)

  const url = await urls.forecastSummary(lat, lon)

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

  const timeZone = locationInfo.timeZone

  result.updated = dateNormalize(properties.updated)
  result.location = locationInfo
  const periods = properties.periods || []
  result.periods = periods.map(period => {
    const sTime = TzDateTime.create(dateNormalize(period.startTime), timeZone)
    const eTime = TzDateTime.create(dateNormalize(period.endTime), timeZone)

    delete period.number
    delete period.startTime
    delete period.endTime

    return Object.assign({ sTime, eTime }, period)
  })

  return result
}

// cli tester
if (require.main === module) main()

async function main () {
  const result = await forLatLon(35.70539, -78.7963)
  console.log(JSON.stringify(result, null, 4))
}
