'use strict'

module.exports = getJSON

const got = require('got')

const logger = require('./logger').create(__filename)

// front-end to got to get JSON but parse separate
async function getJSON (url, options) {
  const errPrefix = `error getting JSON from ${url}`

  if (options == null) options = {}
  options.throwHttpErrors = false

  try {
    var response = await got(url, options)
  } catch (err) {
    throw new Error(`${errPrefix}: ${err.message}`)
  }

  if (response == null) throw new Error(`${errPrefix}: response was null`)
  if (response.statusCode === 404) return null

  const body = response.body

  if (response.statusCode >= 300) {
    const err = new Error(`${errPrefix}: http response ${response.statusCode}`)
    err.httpStatusCode = response.statusCode
    err.body = body
    throw err
  }

  if (body == null) throw new Error(`${errPrefix}: body was null`)

  try {
    return JSON.parse(body)
  } catch (err) {
    const error = new Error(`${errPrefix}: error parsing JSON: ${err.message}`)
    error.body = body

    const bodyPrefix = `${body}`.substr(0, 30)
    logger.warn(`error parsing JSON from ${url}: ${err.message}: "${bodyPrefix}..."`)
    throw error
  }
}
