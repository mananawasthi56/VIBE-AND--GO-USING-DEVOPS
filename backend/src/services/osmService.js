const axios = require('axios')

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org'

const MOOD_TAGS = {
  adventure:  { tags: ['leisure=nature_reserve','leisure=park','tourism=viewpoint'], radius: 8000 },
  relaxing:   { tags: ['leisure=garden','leisure=park','amenity=spa'], radius: 5000 },
  romantic:   { tags: ['amenity=restaurant','tourism=viewpoint','leisure=garden'], radius: 4000 },
  foodie:     { tags: ['amenity=restaurant','amenity=food_court'], radius: 3000 },
  social:     { tags: ['amenity=cafe','amenity=bar','amenity=pub'], radius: 3000 },
  culture:    { tags: ['tourism=museum','tourism=gallery','historic=monument'], radius: 6000 },
  shopping:   { tags: ['shop=mall','amenity=marketplace'], radius: 5000 },
  fitness:    { tags: ['leisure=fitness_centre','leisure=sports_centre'], radius: 4000 },
  coffee:     { tags: ['amenity=cafe'], radius: 2000 },
}

async function searchPlacesByMood(lat, lon, mood) {
  const config = MOOD_TAGS[mood] || MOOD_TAGS['social']
  const { tags, radius } = config

  const tagFilters = tags
    .map((tag) => {
      const [key, value] = tag.split('=')
      return `
        node["${key}"="${value}"](around:${radius},${lat},${lon});
        way["${key}"="${value}"](around:${radius},${lat},${lon});
      `
    })
    .join('\n')

  const query = `
    [out:json][timeout:25];
    (
      ${tagFilters}
    );
    out center 20;
  `

  const response = await axios.post(OVERPASS_URL, query, {
    headers: { 'Content-Type': 'text/plain' },
  })

  const elements = response.data.elements || []

  const places = elements
    .filter((el) => el.tags?.name)
    .map((el) => ({
      id: String(el.id),
      name: el.tags.name,
      category: el.tags.amenity || el.tags.leisure || el.tags.tourism || el.tags.shop || 'place',
      lat: el.lat ?? el.center?.lat,
      lon: el.lon ?? el.center?.lon,
      address: formatAddress(el.tags),
      tags: el.tags,
      mood,
    }))
    .filter((p) => p.lat && p.lon)
    .slice(0, 12)

  return places
}

async function reverseGeocode(lat, lon) {
  try {
    const res = await axios.get(`${NOMINATIM_URL}/reverse`, {
      params: { lat, lon, format: 'json' },
      headers: { 'User-Agent': 'VibeAndGo/1.0' },
    })
    const a = res.data.address
    return a.city || a.town || a.village || a.county || 'Unknown location'
  } catch {
    return 'Unknown location'
  }
}

function formatAddress(tags) {
  const parts = [
    tags['addr:housenumber'],
    tags['addr:street'],
    tags['addr:suburb'],
    tags['addr:city'],
  ].filter(Boolean)
  return parts.join(', ') || tags['description'] || ''
}

module.exports = { searchPlacesByMood, reverseGeocode }