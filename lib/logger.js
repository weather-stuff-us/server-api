'use strict'

// Exports a create function taking file name returning a logger.
// The logger has debug/info/warn/error methods to log messages.
// The arguments to the methods are the same as console.log()

module.exports = {
  create
}

const serverUtils = require('@weather-stuff-us/server-utils')

// create a new logger
function create (fileName) {
  return serverUtils.createLogger(fileName)
}

// cli tester
if (require.main === module) main()

function main () {
  const logger = create(__filename)
  logger.debug('debug')
  logger.info('%s', 'info')
  logger.warn('warn', 42, 'warn')
  logger.error('error', { a: 42 })
}
