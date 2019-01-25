'use strict'

module.exports = {
  metaData,
  forecastSummary,
  forecastGridPoints
}

const OfficeGrid = require('./office-grid')

const BASE_API_URL = 'https://api.weather.gov'

// return url for metadata
async function metaData (lat, lon) {
  return `${BASE_API_URL}/points/${lat},${lon}`
}

// return url for forecast summary
async function forecastSummary (lat, lon) {
  const gridPointsURL = await forecastGridPoints(lat, lon)
  return `${gridPointsURL}/forecast`
}

// return url for forecast grid data
async function forecastGridPoints (lat, lon) {
  const officeGrid = await OfficeGrid.forLatLon(lat, lon)
  if (officeGrid == null) throw new Error(`invalid lat, lon: ${lat}, ${lon}`)

  const { office, gridX, gridY } = officeGrid
  return `${BASE_API_URL}/gridpoints/${office}/${gridX},${gridY}`
}
