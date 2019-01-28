'use strict'

// splits a date and timezone into usable pieces, local to timezone

module.exports = {
  create
}

const LruCache = require('lru-cache')

const TzDateTimeCache = new LruCache(1000)

function create (isoDate, timeZone) {
  const cacheKey = `${isoDate} -- ${timeZone}`
  let result = TzDateTimeCache.get(cacheKey)
  if (result != null) return result

  const date = new Date(isoDate)
  result = build(date, timeZone)
  TzDateTimeCache.set(cacheKey, result)

  return result
}

function build (date, timeZone) {
  let year
  let month
  let day
  let hour
  let minute
  let second
  let locDay

  const formatOptions = {
    timeZone: timeZone,
    hour12: false,
    weekday: 'long',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  }

  let format

  format = new Intl.DateTimeFormat('en-US', formatOptions)
  for (let part of format.formatToParts(date)) {
    if (part.type === 'weekday') locDay = DaysOfTheWeek.indexOf(part.value)
    if (part.type === 'year') year = part.value
    if (part.type === 'month') month = part.value.padStart(2, '0')
    if (part.type === 'day') day = part.value.padStart(2, '0')
    if (part.type === 'hour') hour = part.value.padStart(2, '0')
    if (part.type === 'minute') minute = part.value.padStart(2, '0')
    if (part.type === 'second') second = part.value.padStart(2, '0')
  }

  const isoDate = date.toISOString()
  const locDate = `${year}-${month}-${day}T${hour}:${minute}:${second}`

  return { isoDate, locDate, locDay, timeZone }
}

// used to get the day of the week
const DaysOfTheWeek = 'Sunday Monday Tuesday Wednesday Thursday Friday Saturday'.split(' ')

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

  const date = new Date()
  console.log(`the date is ${date.toISOString()}`)

  for (let tz of tzs) {
    const tzDateTime = create(date, tz)

    console.log(tz.padEnd(20), JSON.stringify(tzDateTime))
  }
}
