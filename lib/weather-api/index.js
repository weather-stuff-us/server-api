'use strict'

const LocationInfo = require('./location-info')
const ForecastSummary = require('./forecast-summary')
const ForecastTimeSeries = require('./forecast-time-series')

const gridData = require('../grid-data')

module.exports = {
  forecastSummary,
  forecastTimeSeries,
  forecastTimeSeriesProperties,
  locationInfo
}

function forecastSummary (lat, lon) {
  return ForecastSummary.forLatLon(lat, lon)
}

function forecastTimeSeries (lat, lon) {
  return ForecastTimeSeries.forLatLon(lat, lon)
}

function forecastTimeSeriesProperties () {
  return gridData.getProperties()
}

function locationInfo (lat, lon) {
  return LocationInfo.forLatLon(lat, lon)
}
