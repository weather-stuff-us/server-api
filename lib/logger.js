'use strict'

module.exports = {
  create
}

const LOGLEVEL = process.env.LOGLEVEL || 'info' // set to 'debug' for more

const path = require('path')
const util = require('util')

function create (fileName) {
  return new Logger(fileName)
}

class Logger {
  constructor (fileName) {
    this._fileName = projectRelativeName(fileName)
  }

  error (...args) { this._log('error', args) }
  warn (...args) { this._log('warn', args) }
  info (...args) { this._log('info', args) }
  debug (...args) { this._log('debug', args) }

  _log (level, args) {
    if (level === 'debug' && LOGLEVEL !== 'debug') return

    level = `[${level.toUpperCase().padEnd(5)}]`
    const message = util.format(...args)
    console.log(`${time()} ${level} ${this._fileName} - ${message}`)
  }
}

function time () {
  let time = new Date().toISOString()
  return time.substr(5).replace('T', ' ').replace('Z', '')
}

function projectRelativeName (fileName) {
  return path.relative(ProjectDir, fileName)
}

const ProjectDir = path.dirname(__dirname)

// cli tester
if (require.main === module) main()

function main () {
  const logger = create(__filename)
  logger.debug('debug')
  logger.info('%s', 'info')
  logger.warn('warn', 42, 'warn')
  logger.error('error', { a: 42 })
}
