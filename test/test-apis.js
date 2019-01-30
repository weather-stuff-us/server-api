'use strict'

const runTest = require('./lib/test-runner')(__filename)

const weatherAPI = require('../weather-stuff-us')

const schemas = weatherAPI.schemas

const LAT = 35.70539
const LON = -78.7963

// api test
runTest(async function astroInfo (t) {
  const result = await weatherAPI.astroInfo(LAT, LON)

  try {
    await schemas.validate(result, schemas.astroInfo)
    t.pass('result structurally sound')
  } catch (err) {
    t.fail(`invalid result: ${err.message}`)
  }

  t.end()
})

// api test
runTest(async function forecastSummary (t) {
  const result = await weatherAPI.forecastSummary(LAT, LON)

  try {
    await schemas.validate(result, schemas.forecastSummary)
    t.pass('result structurally sound')
  } catch (err) {
    t.fail(`invalid result: ${err.message}`)
  }

  t.end()
})

// api test
runTest(async function forecastTimeSeries (t) {
  const result = await weatherAPI.forecastTimeSeries(LAT, LON)

  try {
    await schemas.validate(result, schemas.forecastTimeSeries)
    t.pass('result structurally sound')
  } catch (err) {
    t.fail(`invalid result: ${err.message}`)
  }

  t.end()
})

// api test
runTest(async function locationInfo (t) {
  const result = await weatherAPI.locationInfo(LAT, LON)

  try {
    await schemas.validate(result, schemas.locationInfo)
    t.pass('result structurally sound')
  } catch (err) {
    t.fail(`invalid result: ${err.message}`)
  }

  t.end()
})
