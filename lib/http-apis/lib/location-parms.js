'use strict'

// returns lat/lon from query parms, if not valid, returns immediate with error
module.exports = locationParms

function locationParms (req, res) {
  const location = req.query.location
  if (location == null) {
    res.status(400).send({ error: `query param location not provided` })
    return null
  }

  const [lat, lon] = location.split(',')
  if (lat == null) {
    res.status(400).send({ error: `query param location did not include a latitude` })
    return null
  }
  if (lon == null) {
    res.status(400).send({ error: `query param location did not include a longitude` })
    return null
  }

  return [lat, lon]
}
