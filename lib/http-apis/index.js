'use strict'

module.exports = {
  mount
}

const compression = require('compression')

const logger = require('../logger').create(__filename)

// manually require handlers for check-deps, etc
require('./GET-forecast-summary')
require('./GET-forecast-timeseries-properties')
require('./GET-forecast-timeseries')

const endpoints = [
  { method: 'GET', uri: 'forecast-summary' },
  { method: 'GET', uri: 'forecast-timeseries-properties' },
  { method: 'GET', uri: 'forecast-timeseries' }
]

function mount (app) {
  // add compression where needed
  const compressor = compression()

  for (let endpoint of endpoints) {
    const method = endpoint.method.toLowerCase()
    const uri = `/api/v1/${endpoint.uri}`

    const handler = require(`./${endpoint.method}-${endpoint.uri}`)
    app[method](uri, compressor, handler)
    logger.info(`added http endpoint ${endpoint.method} ${uri}`)
  }
}
