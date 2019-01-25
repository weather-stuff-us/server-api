'use strict'

const ForecastSummary = require('./forecast-summary')
const ForecastTimeSeries = require('./forecast-time-series')

module.exports = {
  forecastSummary,
  forecastTimeSeries,
  forecastTimeSeriesProperties
}

function forecastSummary (lat, lon) {
  return ForecastSummary.forLatLon(lat, lon)
}

function forecastTimeSeries (lat, lon) {
  return ForecastTimeSeries.forLatLon(lat, lon)
}

function forecastTimeSeriesProperties () {

}
