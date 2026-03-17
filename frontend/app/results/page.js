'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false })

const MOODS = {
  adventure: { emoji: '⛰️', color: '#f97316', glow: 'rgba(249,115,22,0.3)', label: 'Adventure' },
  relaxing:  { emoji: '🌿', color: '#22c55e', glow: 'rgba(34,197,94,0.3)',   label: 'Relaxing'  },
  romantic:  { emoji: '🌅', color: '#ec4899', glow: 'rgba(236,72,153,0.3)',  label: 'Romantic'  },
  foodie:    { emoji: '🍜', color: '#eab308', glow: 'rgba(234,179,8,0.3)',   label: 'Foodie'    },
  social:    { emoji: '🎉', color: '#a855f7', glow: 'rgba(168,85,247,0.3)',  label: 'Social'    },
  culture:   { emoji: '🏛️', color: '#3b82f6', glow: 'rgba(59,130,246,0.3)', label: 'Culture'   },
  shopping:  { emoji: '🛍️', color: '#f43f5e', glow: 'rgba(244,63,94,0.3)',  label: 'Shopping'  },
  fitness:   { emoji: '💪', color: '#ef4444', glow: 'rgba(239,68,68,0.3)',   label: 'Fitness'   },
  coffee:    { emoji: '☕', color: '#d97706', glow: 'rgba(217,119,6,0.3)',   label: 'Coffee'    },
}

const VIBE_TAGS = {
  adventure:  ['Outdoor', 'Thrilling', 'Nature', 'Scenic'],
  relaxing:   ['Peaceful', 'Calm', 'Nature', 'Quiet'],
  romantic:   ['Cozy', 'Date spot', 'Scenic', 'Intimate'],
  foodie:     ['Delicious', 'Local', 'Must try', 'Popular'],
  social:     ['Lively', 'Fun', 'Hangout', 'Trendy'],
  culture:    ['Historic', 'Educational', 'Artistic', 'Heritage'],
  shopping:   ['Trendy', 'Bargain', 'Popular', 'Variety'],
  fitness:    ['Active', 'Energy', 'Health', 'Sporty'],
  coffee:     ['Cozy', 'Study spot', 'Wifi', 'Chill'],
}

function ResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const mood = searchParams.get('mood')
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')
  const budget = searchParams.get('budget')

  const [places, setPlaces] = useState([])
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('list')
  const [saved, setSaved] = useState([])
  const [selectedPlace, setSelectedPlace] = useState(null)

  const moodInfo = MOODS[mood] || { emoji: '📍', color: '#22c55e', glow: 'rgba(34,197,94,0.3)', label: 'Places' }
  const vibeTags = VIBE_TAGS[mood] || []

  useEffect(() => {
    if (!mood || !lat || !lon) return
    fetchPlaces()
  }, [mood, lat, lon])

  async function fetchPlaces() {
    try {
      setLoading(true)
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/places/search?lat=${lat}&lon=${lon}&mood=${mood}`
      )
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setPlaces(data.places || [])
      setCity(data.city || '')
    } catch (err) {
      setError('Could not load places. Make sure the backend is running!')
    } finally {
      setLoading(false)
    }
  }

  async function toggleSave(place) {
    const isSaved = saved.includes(place.id)
    if (isSaved) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/saved/${place.id}`, { method: 'DELETE' })
      setSaved(saved.filter(id => id !== place.id))
    } else {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/saved`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...place, osm_id: place.id }),
      })
      setSaved([...saved, place.id])
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#050508', position: 'relative' }}>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .fade-up { animation: fadeUp 0.5s ease both; }
        .place-card:hover { transform: translateY(-2px); border-color: ${moodInfo.color}44 !important; }
        .save-btn:hover { transform: scale(1.2); }
      `}</style>

      {/* Background glow */}
      <div style={{
        position: 'fixed', top: '-20%', right: '-10%',
        width: '500px', height: '500px', borderRadius: '50%',
        background: `radial-gradient(circle, ${moodInfo.glow} 0%, transparent 70%)`,
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '460px', margin: '0 auto', padding: '1.5rem 1rem' }}>

        {/* Header */}
        <div className="fade-up" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <button onClick={() => router.back()} style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#9ca3af', fontSize: '18px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s', flexShrink: 0,
          }}>←</button>
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontFamily: 'var(--font-clash)',
              fontSize: '22px', fontWeight: '700',
              background: `linear-gradient(135deg, ${moodInfo.color}, #fff)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              {moodInfo.emoji} {moodInfo.label} spots
            </h1>
            <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '2px' }}>
              {city} · {places.length} places found
              {budget && ` · Budget: ${budget}`}
            </p>
          </div>
        </div>

        {/* Vibe Tags */}
        {vibeTags.length > 0 && (
          <div className="fade-up" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {vibeTags.map((tag, i) => (
              <span key={tag} style={{
                fontSize: '11px', padding: '4px 12px',
                borderRadius: '20px',
                background: `${moodInfo.color}15`,
                border: `1px solid ${moodInfo.color}30`,
                color: moodInfo.color,
                animation: `fadeUp 0.4s ${i * 0.08}s ease both`,
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="fade-up" style={{
          display: 'flex', gap: '4px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px', padding: '4px', marginBottom: '16px',
        }}>
          {[
            { id: 'list', label: '📋 List' },
            { id: 'map',  label: '🗺️ Map'  },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: 1, padding: '10px', borderRadius: '12px',
              fontSize: '13px', fontWeight: '500', cursor: 'pointer',
              border: 'none', transition: 'all 0.2s',
              background: activeTab === tab.id
                ? `${moodInfo.color}22` : 'transparent',
              color: activeTab === tab.id ? moodInfo.color : '#6b7280',
              boxShadow: activeTab === tab.id
                ? `0 2px 8px ${moodInfo.glow}` : 'none',
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{
              width: '40px', height: '40px',
              border: `3px solid rgba(255,255,255,0.1)`,
              borderTop: `3px solid ${moodInfo.color}`,
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px',
            }} />
            <p style={{ color: '#6b7280', fontSize: '14px' }}>Finding the best {mood} spots...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '16px', padding: '16px', color: '#ef4444', fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        {/* List View */}
        {!loading && !error && activeTab === 'list' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {places.length === 0 && (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: '#4b5563' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
                <p>No places found nearby.</p>
                <p style={{ fontSize: '12px', marginTop: '4px' }}>Try a different mood!</p>
              </div>
            )}
            {places.map((place, i) => (
              <div key={place.id}
                className="place-card"
                onClick={() => setSelectedPlace(selectedPlace?.id === place.id ? null : place)}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: selectedPlace?.id === place.id
                    ? `1px solid ${moodInfo.color}`
                    : '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '20px', padding: '16px',
                  display: 'flex', gap: '12px', alignItems: 'flex-start',
                  cursor: 'pointer', transition: 'all 0.25s',
                  animation: `fadeUp 0.4s ${i * 0.06}s ease both`,
                  boxShadow: selectedPlace?.id === place.id
                    ? `0 4px 24px ${moodInfo.glow}` : 'none',
                }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '22px', flexShrink: 0,
                  background: `${moodInfo.color}18`,
                  border: `1px solid ${moodInfo.color}25`,
                }}>
                  {moodInfo.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#f3f4f6', fontWeight: '600', fontSize: '14px', marginBottom: '2px' }}>
                    {place.name}
                  </p>
                  <p style={{ color: '#6b7280', fontSize: '12px', textTransform: 'capitalize' }}>
                    {place.category}
                  </p>
                  {place.address && (
                    <p style={{ color: '#4b5563', fontSize: '11px', marginTop: '4px',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      📍 {place.address}
                    </p>
                  )}
                  {/* Vibe tags on card */}
                  {selectedPlace?.id === place.id && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                      {vibeTags.slice(0, 3).map(tag => (
                        <span key={tag} style={{
                          fontSize: '10px', padding: '2px 8px', borderRadius: '20px',
                          background: `${moodInfo.color}15`, color: moodInfo.color,
                          border: `1px solid ${moodInfo.color}25`,
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  className="save-btn"
                  onClick={(e) => { e.stopPropagation(); toggleSave(place) }}
                  style={{
                    fontSize: '20px', background: 'none', border: 'none',
                    cursor: 'pointer', transition: 'transform 0.2s', flexShrink: 0,
                  }}>
                  {saved.includes(place.id) ? '❤️' : '🤍'}
                </button>
              </div>
            ))}
          </div>
        )}

      {/* Map View */}
{!loading && !error && activeTab === 'map' && (
  <div style={{
    borderRadius: '20px', overflow: 'hidden',
    border: `1px solid ${moodInfo.color}30`,
    height: '70vh',
    minHeight: '480px',
    boxShadow: `0 8px 32px ${moodInfo.glow}`,
  }}>
    <MapView
      places={places}
      lat={parseFloat(lat)}
      lon={parseFloat(lon)}
      color={moodInfo.color}
    />
  </div>
)}

      </div>
    </main>
  )
}

export default function Results() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#050508', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6b7280' }}>Loading...</p>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  )
}