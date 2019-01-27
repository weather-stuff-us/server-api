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
  result = new TZDateTime(date, isoDate, timeZone)
  TzDateTimeCache.set(cacheKey, result)

  return result
}

class TZDateTime {
  constructor (date, iso, timeZone) {
    this._date = date
    this._iso = iso
    this._timeZone = timeZone

    this._initialize()
  }

  get date () { return this._date }
  get timeZone () { return this._timeZone }

  get tzDate () { return this._tzDate }
  get tzTime () { return this._tzTime }

  get ymdhms () { return `${this.tzDate.ymd} ${this.tzTime.hms}` }

  toJSON () {
    const iso = this._iso
    const timeZone = this.timeZone
    const date = this.tzDate
    const time = this.tzTime
    return { iso, timeZone, date, time }
  }

  _initialize () {
    let year
    let month
    let day
    let hour
    let minute
    let second
    let dayName = {}
    let monthName = {}

    const formatOptions = {
      timeZone: this.timeZone,
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
    for (let part of format.formatToParts(this.date)) {
      if (part.type === 'year') year = parseInt(part.value, 10)
      if (part.type === 'month') month = parseInt(part.value, 10)
      if (part.type === 'day') day = parseInt(part.value, 10)
      if (part.type === 'hour') hour = parseInt(part.value, 10)
      if (part.type === 'minute') minute = parseInt(part.value, 10)
      if (part.type === 'second') second = parseInt(part.value, 10)
    }

    formatOptions.month = formatOptions.weekday = 'long'
    format = new Intl.DateTimeFormat('en-US', formatOptions)
    for (let part of format.formatToParts(this.date)) {
      if (part.type === 'month') monthName.long = part.value
      if (part.type === 'weekday') dayName.long = part.value
    }

    formatOptions.month = formatOptions.weekday = 'short'
    format = new Intl.DateTimeFormat('en-US', formatOptions)
    for (let part of format.formatToParts(this.date)) {
      if (part.type === 'month') monthName.short = part.value
      if (part.type === 'weekday') dayName.short = part.value
    }

    formatOptions.month = formatOptions.weekday = 'narrow'
    format = new Intl.DateTimeFormat('en-US', formatOptions)
    for (let part of format.formatToParts(this.date)) {
      if (part.type === 'month') monthName.narrow = part.value
      if (part.type === 'weekday') dayName.narrow = part.value
    }

    this._tzDate = new TzDate(this.date, this.timeZone, year, month, day, monthName, dayName)
    this._tzTime = new TzTime(hour, minute, second)
  }
}

const TzDateCache = new LruCache(1000)

class TzDate {
  constructor (date, timeZone, year, month, day, monthName, dayName) {
    const cacheKey = `${year}-${month}-${day} -- ${timeZone}`
    let result = TzDateCache.get(cacheKey)
    if (result != null) return result

    this._date = date
    this._timeZone = timeZone

    this._y = year
    this._m = month
    this._d = day

    this._monthName = monthName
    this._dayName = dayName

    this._ymd = asString(this.y, this.m, this.d, '-')

    this._json = {
      ymd: this.ymd,
      monthName: this.monthName,
      dayName: this.dayName
    }

    TzDateCache.set(cacheKey, this)
  }

  get date () { return this._date }
  get timeZone () { return this._timeZone }

  get y () { return this._y }
  get m () { return this._m }
  get d () { return this._d }

  get dayName () { return this._dayName }
  get monthName () { return this._monthName }

  get ymd () { return this._ymd }

  toJSON () { return this._json }
}

const TzTimeCache = new LruCache(1000)

class TzTime {
  constructor (hour, minute, second) {
    const cacheKey = `${hour}:${minute}:${second}`
    let result = TzTimeCache.get(cacheKey)
    if (result != null) return result

    this._h = hour
    this._m = minute
    this._s = second

    this._hms = asString(this.h, this.m, this.s, ':')

    this._json = this.hms

    TzDateCache.set(cacheKey, this)
  }

  get h () { return this._h }
  get m () { return this._m }
  get s () { return this._s }

  get hms () { return this._hms }

  toJSON () { return this._json }
}

function asString (aa, bb, cc, sep) {
  aa = `${aa}`.padStart(2, '0')
  bb = `${bb}`.padStart(2, '0')
  cc = `${cc}`.padStart(2, '0')
  return `${aa}${sep}${bb}${sep}${cc}`
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

  const date = new Date()
  console.log(`the date is ${date.toISOString()}`)

  for (let tz of tzs) {
    const tzDateTime = create(date, tz)

    console.log(tz.padEnd(20), JSON.stringify(tzDateTime))
  }

  for (let tz of tzs) {
    const tzDateTime = create(date, tz)

    console.log(tz.padEnd(20), JSON.stringify(tzDateTime.tzDate))
  }

  for (let tz of tzs) {
    const tzDateTime = create(date, tz)

    console.log(tz.padEnd(20), JSON.stringify(tzDateTime.tzTime))
  }

  for (let tz of tzs) {
    const tzDateTime = create(date, tz)

    console.log(tz.padEnd(20), tzDateTime.ymdhms, '-', tzDateTime.tzDate.ymd, '-', tzDateTime.tzTime.hms)
  }
}
