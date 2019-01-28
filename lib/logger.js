'use strict'

// Exports a create function taking file name returning a logger.
// The logger has debug/info/warn/error methods to log messages.
// The arguments to the methods are the same as console.log()

module.exports = {
  create
}

// set to 'debug' to see debug messages also
const LOG_LEVEL = process.env.LOG_LEVEL || 'info'

// set to any string to not log the time
const LOG_NO_TIME = process.env.LOG_NO_TIME != null

const path = require('path')
const util = require('util')

const chalk = require('chalk')

const PackageInfo = require('./package-info')

// create a new logger
function create (fileName) {
  return new Logger(fileName)
}

class Logger {
  constructor (fileName) {
    const packageInfo = PackageInfo.forFileName(fileName)
    this._package = packageInfo.name
    this._fileName = path.relative(packageInfo.dir, fileName)
  }

  error (...args) { this._log('error', args) }
  warn (...args) { this._log('warn', args) }
  info (...args) { this._log('info', args) }
  debug (...args) { this._log('debug', args) }

  _log (level, args) {
    if (level === 'debug' && LOG_LEVEL !== 'debug') return

    level = fancyLevel(level)
    const message = util.format(...args)

    const timePart = LOG_NO_TIME ? '' : `${time()} `
    console.log(`${timePart}${level} ${this._package} ${this._fileName} - ${message}`)
  }
}

function fancyLevel (level) {
  let colorFn = (s) => s

  switch (level) {
    case 'debug': colorFn = chalk.bgBlue.white.bold; break
    case 'warn': colorFn = chalk.bgYellow.black.bold; break
    case 'error': colorFn = chalk.bgRed.white.bold; break
  }

  level = `[${level.toUpperCase()}]`.padEnd(7)
  return colorFn(level)
}

function time () {
  let time = new Date().toISOString()
  return time.replace('T', ' ').replace('Z', '')
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
