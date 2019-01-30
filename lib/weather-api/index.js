'use strict'

const LocationInfo = require('../location-info')
const ForecastSummary = require('./forecast-summary')
const ForecastTimeSeries = require('./forecast-time-series')
const AstroInfo = require('../astro-info')
const schemas = require('./schemas')

module.exports = {
  forecastSummary,
  forecastTimeSeries,
  locationInfo,
  astroInfo,
  schemas
}

function forecastSummary (lat, lon) {
  return ForecastSummary.forLatLon(lat, lon)
}

function forecastTimeSeries (lat, lon) {
  return ForecastTimeSeries.forLatLon(lat, lon)
}

function locationInfo (lat, lon) {
  return LocationInfo.forLatLon(lat, lon)
}

function astroInfo (lat, lon, startDate, endDate) {
  return AstroInfo.getInfo(lat, lon, startDate, endDate)
}
