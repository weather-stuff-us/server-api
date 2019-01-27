'use script'

/* global c3, fetch */

async function buildChart () {
  const data = await getJSON(`/api/v1/forecast/time-series?location=35.70539,-78.7963`)

  const dates = ['x']
  const temps = ['temperature']
  const dewps = ['dewpoint']

  let lastTemp = 0
  let lastDewp = 0

  for (let date of data.dates) {
    const ymd = date.date.ymd

    for (let time of date.times) {
      const hms = time.time

      let temp = lastTemp
      let dewp = lastDewp

      for (let property of time.properties) {
        if (property.property === 'temperature') temp = property.value
        if (property.property === 'dewpoint') dewp = property.value
      }

      dates.push(new Date(`${ymd}T${hms}Z`))
      temps.push(temp)
      dewps.push(dewp)

      lastTemp = temp
      lastDewp = dewp
    }
  }

  c3.generate({
    data: {
      x: 'x',
      columns: [ dates, temps, dewps ],
      type: 'spline'
    },
    axis: {
      x: {
        type: 'timeseries',
        tick: {
          format: '%m-%d',
          fit: true
        }
      }
    },
    point: {
      show: false
    }
  })
}

// get the json from a url
async function getJSON (url) {
  try {
    var response = await fetch(url)
  } catch (err) {
    return { error: `error fetching ${url}: ${err.message}` }
  }

  if (response.status >= 400 && response.status < 500) {
    return null
  }

  try {
    var result = await response.json()
  } catch (err) {
    return { error: `error parsing json from ${url}: ${err.message}` }
  }

  return result
}

// build chart on window load
if (document.readyState === 'loading') {
  window.addEventListener('load', buildChart)
} else {
  buildChart()
}
