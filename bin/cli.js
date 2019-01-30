#!/usr/bin/env node

'use strict'

const fs = require('fs')
const path = require('path')
const weatherAPI = require('../weather-stuff-us')

// run main if this is the main module launched
if (require.main === module) setImmediate(main, ...(process.argv.slice(2)))

// main program
async function main (lat, lon) {
  if (lat == null) help()
  if (lon == null) {
    const [ parsedLat, parsedLon ] = lat.split(',')
    if (parsedLon == null) help()

    lat = parsedLat
    lon = parsedLon
  }

  const [ latArg, lonArg ] = [ lat, lon ]

  lat = parseFloat(latArg)
  lon = parseFloat(lonArg)

  if (isNaN(lat)) {
    console.log(`latitude arg is not a number: ${latArg}`)
    process.exit(1)
  }

  if (isNaN(lon)) {
    console.log(`longitude arg is not a number: ${lonArg}`)
    process.exit(1)
  }

  try {
    var summary = await weatherAPI.forecastSummary(lat, lon)
  } catch (err) {
    console.log(`error getting forecast summary: ${err.message}`)
    process.exit(1)
  }

  printSummary(summary)

  console.log('')

  try {
    var astroInfo = await weatherAPI.astroInfo(lat, lon)
  } catch (err) {
    console.log(`error getting astro info: ${err.message}`)
    process.exit(1)
  }

  printAstroInfo(astroInfo)
}

function printSummary (summary) {
  const updatedDate = new Date(summary.updated)

  const location = summary.location
  const locationName = location.name
  const elevation = location.elevationFt
  const lat = location.lat
  const lon = location.lon
  const timeZone = location.timeZone

  const title = `weather summary for ${locationName}`
  console.log(title)
  console.log(''.padEnd(title.length, '='))
  console.log(`  time zone: ${timeZone}`)
  console.log(`  updated:   ${updatedDate.toString()}`)
  console.log(`  elevation: ${elevation} ft`)
  console.log(`  coords:    ${lat},${lon}`)

  for (const period of summary.periods) {
    console.log('')
    console.log(period.name)
    console.log(`${''.padStart(period.name.length, '-')}`)
    console.log(period.detailedForecast)
  }
}

function printAstroInfo (astroInfo) {
  astroInfo.events.sort((a, b) => a.date.locDate.localeCompare(b.date.locDate))

  console.log('Astronomicon events')
  console.log('===================')

  let lastDay = null
  for (const event of astroInfo.events) {
    const currDay = event.date.locDay
    if (currDay !== lastDay) {
      const dow = DOW[event.date.locDay]
      console.log('')
      const dateLabel = `${dow.padEnd(10)} ${event.date.locDate.slice(0, 10)}`
      console.log(dateLabel)
      console.log('---------------------')
    }

    lastDay = currDay

    const time = getLocalDate(event)
    const eventText = event.text == null ? '' : ` - ${event.text}`
    console.log(`  ${event.event.padEnd(8)} - ${time}${eventText}`)
  }
}

function getLocalDate (event) {
  const time = event.date.locDate.slice(11)

  return time
}

const DOW = 'Sunday Monday Tuesday Wednesday Thursday Friday Saturday'.split(' ')

function help () {
  const packageJson = require('../package.json')
  const readmeName = path.join(__dirname, 'HELP.md')

  let readme = fs.readFileSync(readmeName, 'utf8')
  readme = readme.replace(/%%version%%/g, packageJson.version)
  readme = readme.replace(/%%homepage%%/g, packageJson.homepage)
  console.log(readme)
  process.exit(1)
}
