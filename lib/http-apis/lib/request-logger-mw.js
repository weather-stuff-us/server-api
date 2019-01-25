'use strict'

// log requests and responses

module.exports = requestLoggerMW

const logger = require('../../logger').create(__filename)

function requestLoggerMW (req, res, next) {
  res.once('finish', finished)

  res.locals.requestStartTime = Date.now()

  next()

  // function called when response is finally sent (to the OS)
  function finished () {
    const elapsedMS = Date.now() - res.locals.requestStartTime

    const logLine = `
      ${res.locals.id}
      http-request
      ${res.statusCode}
      ${req.method}
      ${req.originalUrl}
      ${elapsedMS}ms
    `.replace(/\s+/g, ' ').trim()

    logger.info(logLine)
  }
}
