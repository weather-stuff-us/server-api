'use strict'

// Converts an iso date and tz into an object with local date for that tz.

module.exports = dateLocalize

const dateFnsTimeZone = require('date-fns-timezone')

const dateNormalize = require('./date-normalize')

function dateLocalize (isoDate, timeZone) {
  if (isoDate == null) return null
  if (timeZone == null) return null

  isoDate = dateNormalize(isoDate)
  if (isoDate == null) return null

  // minutes since epoch
  const epochMinutes = Math.round(new Date(isoDate).getTime() / 1000 / 60)

  const result = { isoDate, timeZone, epochMinutes }

  const format = 'YYYY % M % MMM % MMMM % D % dd % ddd % dddd % H % m % s'
  const options = { timeZone }
  try {
    var formattedString = dateFnsTimeZone.formatToTimeZone(isoDate, format, options)
  } catch (err) {
    return null
  }

  return Object.assign(result, parseFormattedString(formattedString))
}

// parse the formatted string and return an object
function parseFormattedString (string) {
  const match = string.match(/^(.*) % (.*) % (.*) % (.*) % (.*) % (.*) % (.*) % (.*) % (.*) % (.*) % (.*)$/)
  if (match == null) return null

  let [ year, month, monthShort, monthLong, day, dayShort2, dayShort3, dayLong, hour, minute, second ] = match.slice(1)

  year = parseInt(year, 10)
  month = parseInt(month, 10)
  day = parseInt(day, 10)
  hour = parseInt(hour, 10)
  minute = parseInt(minute, 10)
  second = parseInt(second, 10)

  return { year, month, monthShort, monthLong, day, dayShort2, dayShort3, dayLong, hour, minute, second }
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

  const iDate = new Date('2019-01-02T12:00:00').toISOString()
  for (let tz of tzs) {
    const lDate = dateLocalize(iDate, tz)
    console.log(tz.padEnd(20), iDate)
    console.log(tz.padEnd(20), JSON.stringify(lDate, null, 4))
    console.log('')
  }
}
