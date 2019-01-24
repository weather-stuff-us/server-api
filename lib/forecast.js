'use strict'

module.exports = {
  forLatLon
}

const BASE_API_URL = 'https://api.weather.gov'

// apex, nc
const DEFAULT_LAT = 35.705437
const DEFAULT_LON = -78.796262

const _ = require('./lodash')
const utils = require('./utils')
const getJSON = require('./get-json')
const dateNormalize = require('./date-normalize')
const gridData = require('./grid-data')

// get the forecast data for lat, lon
async function forLatLon (latArg, lonArg) {
  const { lat, lon } = ensureLatLon(latArg, lonArg)

  const metaData = await getJSON(`${BASE_API_URL}/points/${lat},${lon}`)
  if (metaData == null) return null

  const city = _.get(metaData, 'properties.relativeLocation.properties.city', 'Unknown City')
  const state = _.get(metaData, 'properties.relativeLocation.properties.state', 'US')
  const timeZone = _.get(metaData, 'properties.timeZone')

  const location = `${city}, ${state}`
  const provider = 'api.weather.gov'

  const forecastURL = _.get(metaData, 'properties.forecast')
  const forecastGridDataURL = _.get(metaData, 'properties.forecastGridData')

  const [ forecast, forecastGridData ] = (await Promise.all([
    getJSON(forecastURL),
    getJSON(forecastGridDataURL)
  ])).map(data => _.get(data, 'properties'))

  const summary = forecastToSummary(forecast)
  const hourly = forecastGridDataToHourly(forecastGridData)

  return {
    provider, lat, lon, location, timeZone, summary, hourly
  }
}

function forecastGridDataToHourly (forecastGridData) {
  const result = {}

  result.updated = dateNormalize(forecastGridData.updateTime)
  result.times = gridData.transform(forecastGridData)

  return result
}

function forecastToSummary (forecast) {
  const result = {}

  result.updated = dateNormalize(forecast.updated)
  const periods = forecast.periods || []
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

function ensureLatLon (lat, lon) {
  return { lat: ensureLat(lat), lon: ensureLon(lon) }
}

function ensureLat (value) {
  const orig = value
  if (value == null) value = DEFAULT_LAT

  if (typeof value !== 'number') value = utils.parseNumber(value)

  if (value == null) throw new Error(`invalid latitude value: ${orig}`)
  if (value > 90 || value < -90) throw new Error(`latitude value not in range: ${orig}`)

  return value
}

function ensureLon (value) {
  const orig = value
  if (value == null) value = DEFAULT_LON

  if (typeof value !== 'number') value = utils.parseNumber(value)

  if (value == null) throw new Error(`invalid longitude value: ${orig}`)
  if (value > 360 || value < -360) throw new Error(`longitude value not in range: ${orig}`)

  return value
}

// cli tester
if (require.main === module) main()

async function main () {
  const forecastData = await forLatLon() // apex, nc
  console.log(JSON.stringify(forecastData, null, 4))
}
