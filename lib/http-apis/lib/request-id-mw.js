'use strict'

// assign a UUID to every request / response

module.exports = requestIdMW

const uuid = require('uuid')

function requestIdMW (req, res, next) {
  const uuid7 = uuid.v4().substr(0, 7)

  res.locals.id = uuid7
  res.set('X-weather-stuff-us-request-id', uuid7)
  next()
}
