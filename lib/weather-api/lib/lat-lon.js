'use strict'

module.exports = {
  normalize
}

const utils = require('../../utils')

// take {lat, lon}, returning {lat, lon}, normalized, with error checking
function normalize ({ lat, lon }) {
  return { lat: normalizeLat(lat), lon: normalizeLon(lon) }
}

function normalizeLat (value) {
  const orig = value
  if (value == null) throw new utils.InvalidInputValueError('latitude value was null')

  if (typeof value !== 'number') value = utils.parseNumber(value)

  if (value == null) throw new utils.InvalidInputValueError(`invalid latitude value: ${orig}`)
  if (value > 90 || value < -90) throw new utils.InvalidInputValueError(`latitude value not in range: ${orig}`)

  return utils.round(value, 3)
}

function normalizeLon (value) {
  const orig = value
  if (value == null) throw new utils.InvalidInputValueError('longitude value was null')

  if (typeof value !== 'number') value = utils.parseNumber(value)

  if (value == null) throw new utils.InvalidInputValueError(`invalid longitude value: ${orig}`)
  if (value > 360 || value < -360) throw new utils.InvalidInputValueError(`longitude value not in range: ${orig}`)

  return utils.round(value, 3)
}
