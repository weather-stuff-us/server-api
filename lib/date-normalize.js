'use strict'

// api.weather.gov supplies some oddball ISO time strings like
//    2019-01-23T20:00:00+00:00/PT1H
// This removes the bits after and including the /, returning a new ISO date
// string.  A null is returned if the date can't be converted successfully.

module.exports = dateNormalize

function dateNormalize (isoDate) {
  if (isoDate == null) return null
  if (typeof isoDate !== 'string') return null

  isoDate = isoDate.replace(/\/.*$/, '')

  const result = new Date(isoDate)
  if (isNaN(result.getDate())) return null

  return result.toISOString()
}
