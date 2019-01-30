'use strict'

// Returns sun and moon info around a date.

module.exports = {
  getInfo
}

const SunCalc = require('suncalc')

const utils = require('./utils')
const moonPhases = require('./moon-phases')
const TzDateTime = require('./tz-date-time')
const LocationInfo = require('./location-info')

// expects date objects as parms
// returns [ { date: Date, event: String, value: optional } ]
async function getInfo (lat, lon, sDate, eDate) {
  const locationInfo = await LocationInfo.forLatLon(lat, lon)
  if (locationInfo == null) throw new Error(`no location info available`)

  if (sDate == null) {
    sDate = new Date()
  }

  if (eDate == null) {
    eDate = new Date(sDate.getTime() + 7 * MS_IN_A_DAY)
  }

  const result = []

  const sDateMs = sDate.getTime() - MS_IN_A_DAY
  const eDateMs = eDate.getTime() + MS_IN_A_DAY

  for (let dateMs = sDateMs; dateMs <= eDateMs; dateMs += MS_IN_A_DAY) {
    const date = new Date(dateMs)

    const sunInfo = SunCalc.getTimes(date, lat, lon)
    for (let prop of Object.keys(sunInfo)) {
      if (prop !== 'sunrise' && prop !== 'sunset') continue
      result.push({
        time: sunInfo[prop].getTime(),
        event: prop
      })
    }

    const moonLight = SunCalc.getMoonIllumination(date)
    const moonPhase = moonLight.phase

    const moonTimes = SunCalc.getMoonTimes(date, lat, lon)
    if (moonTimes.rise != null) {
      result.push({
        time: moonTimes.rise.getTime(),
        event: 'moonrise',
        value: utils.round(moonPhase, 2),
        text: moonPhases.getText(moonPhase)
      })
    }

    if (moonTimes.set != null) {
      result.push({
        time: moonTimes.set.getTime(),
        event: 'moonset',
        value: utils.round(moonPhase, 2),
        text: moonPhases.getText(moonPhase)
      })
    }
  }

  result.sort((a, b) => a.time - b.time)

  for (const data of result) {
    data.date = TzDateTime.create(data.time, locationInfo.timeZone)
    delete data.time
  }

  return { location: locationInfo, events: result }
}

const MS_IN_AN_HOUR = 1000 * 60 * 60
const MS_IN_A_DAY = MS_IN_AN_HOUR * 24

// cli tester
if (require.main === module) main()

function main () {
  const astroInfos = getInfo(35.70539, -78.7963, new Date())

  for (let { date, event, value } of astroInfos) {
    date = JSON.stringify(date)
    value = value || ''

    console.log(date, event, value)
  }
}
