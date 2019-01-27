'use strict'

const getJSON = require('../lib/get-json')

const runTest = require('./lib/test-runner')(__filename)

const URL_PREFIX = 'http://localhost:3000/api/v1'
const LOCATION_PARM = 'location=35.70539,-78.7963'

// test for basic invalid steps
runTest(async function apiSuccess (t) {
  await getJSON(`${URL_PREFIX}/astro/info?${LOCATION_PARM}`)
  await getJSON(`${URL_PREFIX}/forecast/summary?${LOCATION_PARM}`)
  await getJSON(`${URL_PREFIX}/forecast/time-series?${LOCATION_PARM}`)
  await getJSON(`${URL_PREFIX}/forecast/time-series/properties`)
  await getJSON(`${URL_PREFIX}/location/info?${LOCATION_PARM}`)

  t.pass('need to add tests')
  t.end()
})
