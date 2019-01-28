'use strict'

const LocationInfo = require('../location-info')
const ForecastSummary = require('./forecast-summary')
const ForecastTimeSeries = require('./forecast-time-series')

module.exports = {
  forecastSummary,
  forecastTimeSeries,
  locationInfo
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
