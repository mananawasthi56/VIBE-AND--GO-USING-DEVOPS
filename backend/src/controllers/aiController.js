const { getAIPlaceSuggestions, getWeatherMood } = require('../services/aiService')

async function getAISuggestion(req, res, next) {
  try {
    const { text, lat, lon } = req.body

    if (!text || !lat || !lon) {
      return res.status(400).json({ error: 'text, lat and lon are required' })
    }

    // Get weather context
    const weather = await getWeatherMood(lat, lon)
    const weatherText = weather ? `${weather.condition}` : null

    // Get AI suggestion
    const suggestion = await getAIPlaceSuggestions(text, lat, lon, weatherText)

    res.json({
      suggestion,
      weather,
    })
  } catch (err) {
    next(err)
  }
}

async function getWeather(req, res, next) {
  try {
    const { lat, lon } = req.query
    if (!lat || !lon) {
      return res.status(400).json({ error: 'lat and lon are required' })
    }
    const weather = await getWeatherMood(parseFloat(lat), parseFloat(lon))
    res.json({ weather })
  } catch (err) {
    next(err)
  }
}

module.exports = { getAISuggestion, getWeather }