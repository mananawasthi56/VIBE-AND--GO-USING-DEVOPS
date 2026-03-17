const express = require('express')
const { getAISuggestion, getWeather } = require('../controllers/aiController')

const router = express.Router()

// POST /api/ai/suggest
router.post('/suggest', getAISuggestion)

// GET /api/ai/weather?lat=&lon=
router.get('/weather', getWeather)

module.exports = router