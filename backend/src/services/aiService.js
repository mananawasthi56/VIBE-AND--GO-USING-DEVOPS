const Groq = require('groq-sdk')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
console.log('GROQ KEY:', process.env.GROQ_API_KEY ? 'Found ✅' : 'Missing ❌')

async function getAIPlaceSuggestions(userText, lat, lon, weather = null) {
  const timeOfDay = getTimeOfDay()
  const weatherContext = weather ? `Current weather: ${weather}.` : ''

  const prompt = `
You are a smart local place recommendation engine.

User says: "${userText}"
Time of day: ${timeOfDay}
Location: lat ${lat}, lon ${lon}
${weatherContext}

Based on this, suggest the best type of places to visit.
Respond ONLY with a valid JSON object like this:
{
  "mood": "relaxing",
  "vibes": ["cozy", "quiet", "study spot"],
  "placeTypes": ["cafe", "park", "library"],
  "reason": "You seem to want a quiet place to relax or focus.",
  "budgetSuggestion": "low",
  "timeNote": "Great choice for evening!",
  "emoji": "☕"
}

mood must be one of: adventure, relaxing, romantic, foodie, social, culture, shopping, fitness, coffee
budgetSuggestion must be one of: free, low, medium, high
Only respond with the JSON, no extra text.
`

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 300,
  })

  const text = response.choices[0]?.message?.content || ''
  console.log('AI response:', text)

  try {
    const clean = text.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch {
    return {
      mood: 'social',
      vibes: ['fun', 'lively'],
      placeTypes: ['cafe', 'park'],
      reason: 'Sounds like a great time to explore!',
      budgetSuggestion: 'low',
      timeNote: '',
      emoji: '🎉',
    }
  }
}

async function getWeatherMood(lat, lon) {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    )
    const data = await res.json()
    const code = data.current_weather?.weathercode

    if (code === 0) return { condition: 'sunny', emoji: '☀️', suggestion: 'Hot day! Great for ice cream spots or malls.' }
    if (code <= 3) return { condition: 'cloudy', emoji: '⛅', suggestion: 'Nice weather for a walk or cafe.' }
    if (code <= 67) return { condition: 'rainy', emoji: '🌧️', suggestion: 'Rainy day! Perfect for cozy cafes and chai.' }
    if (code <= 77) return { condition: 'snowy', emoji: '❄️', suggestion: 'Snowy! Find a warm indoor spot.' }
    return { condition: 'windy', emoji: '💨', suggestion: 'Breezy day! Great for parks.' }
  } catch {
    return null
  }
}

function getTimeOfDay() {
  const hour = new Date().getHours()
  if (hour < 6) return 'late night'
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  if (hour < 21) return 'evening'
  return 'night'
}

module.exports = { getAIPlaceSuggestions, getWeatherMood }