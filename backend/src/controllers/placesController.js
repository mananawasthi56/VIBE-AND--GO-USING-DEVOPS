const { searchPlacesByMood, reverseGeocode } = require('../services/osmService')
const SearchLog = require('../models/SearchLog')

async function getPlacesByMood(req, res, next) {
  try {
    const { lat, lon, mood } = req.query

    if (!lat || !lon || !mood) {
      return res.status(400).json({ error: 'lat, lon, and mood are required' })
    }

    const latitude = parseFloat(lat)
    const longitude = parseFloat(lon)

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ error: 'Invalid coordinates' })
    }

    const places = await searchPlacesByMood(latitude, longitude, mood)
    const city = await reverseGeocode(latitude, longitude)

    // Log the search
    await SearchLog.create({
      mood,
      lat: latitude,
      lon: longitude,
      city,
      resultsCount: places.length,
    })

    res.json({ places, city, mood, total: places.length })
  } catch (err) {
    next(err)
  }
}

async function getTopMoods(_req, res, next) {
  try {
    const topMoods = await SearchLog.aggregate([
      { $group: { _id: '$mood', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ])
    res.json(topMoods)
  } catch (err) {
    next(err)
  }
}

module.exports = { getPlacesByMood, getTopMoods }