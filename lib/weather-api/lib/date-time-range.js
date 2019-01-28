'use strict'

// parse ISO dates with range suffix
// - /PTxH   - x hours
// - /PxD    - x days
// - /PxDTyH - x days + y hours

module.exports = {
  parse
}

const LruCache = require('lru-cache')

const logger = require('../../logger').create(__filename)

const DateRangeCache = new LruCache(500)

// parse iso date w/ suffix, returning [start: Date, end: Date]
function parse (isoDateWithSuffix) {
  if (DateRangeCache.has(isoDateWithSuffix)) {
    return DateRangeCache.get(isoDateWithSuffix)
  }

  const result = basicParse(isoDateWithSuffix)
  DateRangeCache.set(isoDateWithSuffix, result)

  return result
}

function basicParse (isoDateWithSuffix) {
  if (isoDateWithSuffix == null) return null

  const [ dateString, suffix ] = isoDateWithSuffix.split('/')

  const date = parseDate(dateString)
  if (date == null) return null

  // no suffix
  if (suffix == null) {
    return [ date ]
  }

  // deal with suffixes
  let match

  // Subtract an hour; a range like PT1H is one hour, so start and stop are
  // the same.
  let dateMillis = date.getTime()

  // - /PTxH   - x hours
  match = suffix.match(/^PT(\d*)H$/)
  if (match != null) {
    const hours = parseInt(match[1], 10)
    return createRange(dateMillis, hours)
  }

  // - /PxD    - x days
  match = suffix.match(/^P(\d*)D$/)
  if (match != null) {
    const days = parseInt(match[1], 10)
    return createRange(dateMillis, days * 24)
  }

  // - /PxDTyH - x days + y hours
  match = suffix.match(/^P(\d*)DT(\d*)H$/)
  if (match != null) {
    const days = parseInt(match[1], 10)
    const hours = parseInt(match[2], 10)
    return createRange(dateMillis, days * 24 + hours)
  }

  logger.warn(`unable to parse date suffix "${suffix}"`)
  return [ date ]
}

// create an array of dates, each incremented by an hour, for number of hours
function createRange (dateMillis, hours) {
  const result = []

  for (let hour = 0; hour < hours; hour++) {
    result.push(new Date(dateMillis))
    dateMillis += MILLIS_IN_AN_HOUR
  }

  return result
}

// parse an ISO date into a Date object, flooring to hours
function parseDate (isoDate) {
  if (isoDate == null) return null

  isoDate = isoDate.replace(/:\d\d:\d\d/, ':00:00')

  try {
    const date = new Date(isoDate)
    date.toISOString() // this will throw for invalid dates
    return date
  } catch (err) {
    logger.warn(`unable to parse date "${isoDate}"`)
    return null
  }
}

const MILLIS_IN_AN_HOUR = 1000 * 60 * 60

// cli tester

if (require.main === module) main()

function main () {
  print('2019-02-03T16:01:00+00:00')
  print('2019-02-03T16:02:00+00:00/PT1H')
  print('2019-02-03T16:03:00+00:00/PT2H')
  print('2019-02-03T16:04:05+00:00/P1D')
  print('2019-02-03T16:00:06+00:00/P1DT2H')
  print(null)
  print('nope')
  print('nope/P1DT21H')
  print('2019-02-03T16:00:00+00:00/nope')
}

function print (isoDateWithSuffix) {
  console.log('')
  console.log(`input:  ${isoDateWithSuffix}`)

  const result = parse(isoDateWithSuffix)

  if (result == null) {
    console.log('result:', result)
    return
  }

  for (const element of result) {
    console.log(`date:   ${element.toISOString()}`)
  }
}
