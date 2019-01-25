'use strict'

module.exports = {
  mount
}

const compression = require('compression')

const requestIdMW = require('./lib/request-id-mw')
const requestLoggerMW = require('./lib/request-logger-mw')

const logger = require('../logger').create(__filename)

// manually require handlers for check-deps, etc
require('./GET-forecast-summary')
require('./GET-forecast-time-series-properties')
require('./GET-forecast-time-series')
require('./GET-location-info')

const endpoints = [
  { method: 'GET', uri: 'forecast-summary' },
  { method: 'GET', uri: 'forecast-time-series-properties' },
  { method: 'GET', uri: 'forecast-time-series' },
  { method: 'GET', uri: 'location-info' }
]

function mount (app) {
  // add compression where needed
  const compressor = compression()

  for (let endpoint of endpoints) {
    const method = endpoint.method.toLowerCase()
    const uri = `/api/v1/${endpoint.uri}`

    const handler = require(`./${endpoint.method}-${endpoint.uri}`)
    app[method](uri, requestIdMW, requestLoggerMW, compressor, handler)
    logger.info(`added http endpoint ${endpoint.method} ${uri}`)
  }
}
