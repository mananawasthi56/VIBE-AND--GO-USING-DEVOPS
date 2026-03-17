const express = require('express')
const { getPlacesByMood, getTopMoods } = require('../controllers/placesController')

const router = express.Router()

// GET /api/places/search?lat=&lon=&mood=
router.get('/search', getPlacesByMood)

// GET /api/places/top-moods
router.get('/top-moods', getTopMoods)

module.exports = router