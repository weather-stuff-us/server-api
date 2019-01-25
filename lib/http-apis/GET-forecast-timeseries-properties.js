'use strict'

module.exports = handler

const gridData = require('../grid-data')

async function handler (req, res, next) {
  res.send(gridData.getProperties())
}
