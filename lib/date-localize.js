'use strict'

// Converts an iso date and timezone into a local date for that timezone.
// The format is `YYYY-MM-DDTHH:mm:ss`, but no suffix, so means "local".
// Meant just for parsing, since if you use a typical Date() function with it,
// it will assume it's your computer's local time.

module.exports = dateLocalize

const dateFnsTimeZone = require('date-fns-timezone')

const dateNormalize = require('./date-normalize')

function dateLocalize (isoDate, timeZone) {
  if (isoDate == null) return null
  if (timeZone == null) return null

  isoDate = dateNormalize(isoDate)
  if (isoDate == null) return null

  const format = 'YYYY-MM-DDTHH:mm:ss'
  const options = { timeZone }
  try {
    return dateFnsTimeZone.formatToTimeZone(isoDate, format, options)
  } catch (err) {
    return null
  }
}

// cli tester
if (require.main === module) main()

function main () {
  const tzs = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Anchorage',
    'Pacific/Honolulu'
  ]

  const iDate = new Date('2019-01-01T12:00:00').toISOString()
  for (let tz of tzs) {
    const lDate = dateLocalize(iDate, tz)
    console.log(tz.padEnd(20), iDate)
    console.log(tz.padEnd(20), lDate)
    console.log('')
  }
}
