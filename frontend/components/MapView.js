'use client'
import { useEffect, useRef, useState } from 'react'

export default function MapView({ places, lat, lon, color }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const routeLayerRef = useRef(null)
  const [routeInfo, setRouteInfo] = useState(null)
  const [travelMode, setTravelMode] = useState('driving')
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [loadingRoute, setLoadingRoute] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!mapRef.current) return
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    import('leaflet').then((L) => {
      delete L.default.Icon.Default.prototype._getIconUrl
      L.default.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      mapRef.current._leaflet_id = null
      const map = L.default.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView([lat, lon], 13)

      // Multiple invalidateSize calls to fix tile loading
      setTimeout(() => map.invalidateSize(), 100)
      setTimeout(() => map.invalidateSize(), 300)
      setTimeout(() => map.invalidateSize(), 600)
      setTimeout(() => map.invalidateSize(), 1000)

      mapInstanceRef.current = map

      L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        tileSize: 256,
        zoomOffset: 0,
      }).addTo(map)

      // User location marker
      const userIcon = L.default.divIcon({
        className: '',
        html: `<div style="width:16px;height:16px;background:#22c55e;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>`,
        iconSize: [16, 16], iconAnchor: [8, 8],
      })
      L.default.marker([lat, lon], { icon: userIcon })
        .addTo(map)
        .bindPopup('<strong>📍 You are here</strong>')

      // Place markers
      const bounds = [[lat, lon]]
      places.forEach((place) => {
        bounds.push([place.lat, place.lon])
        const placeIcon = L.default.divIcon({
          className: '',
          html: `<div style="width:28px;height:28px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>`,
          iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -28],
        })
        const marker = L.default.marker([place.lat, place.lon], { icon: placeIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:sans-serif;min-width:160px;">
              <strong style="font-size:13px;">${place.name}</strong>
              <p style="font-size:11px;color:#9ca3af;margin:4px 0;">${place.category}</p>
              <button onclick="window.getRoute(${place.lat},${place.lon},'${place.name}')"
                style="background:#22c55e;color:white;border:none;padding:6px 12px;border-radius:8px;font-size:12px;cursor:pointer;width:100%;margin-top:4px;font-weight:600;">
                🗺️ Get Directions
              </button>
            </div>
          `)
        marker.on('click', () => {
          window.selectedPlaceLat = place.lat
          window.selectedPlaceLon = place.lon
          window.selectedPlaceName = place.name
        })
      })

      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [40, 40] })
      }

      // Global function for popup button
      window.getRoute = (placeLat, placeLon, placeName) => {
        setSelectedPlace({ lat: placeLat, lon: placeLon, name: placeName })
        drawRoute(L, map, lat, lon, placeLat, placeLon, 'driving')
      }
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
      delete window.getRoute
    }
  }, [lat, lon, places, color])

  async function drawRoute(L, map, fromLat, fromLon, toLat, toLon, mode) {
    setLoadingRoute(true)
    setRouteInfo(null)

    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current)
      routeLayerRef.current = null
    }

    try {
      const profile = mode === 'driving' ? 'car' : mode === 'walking' ? 'foot' : 'bike'
      const url = `https://router.project-osrm.org/route/v1/${profile}/${fromLon},${fromLat};${toLon},${toLat}?overview=full&geometries=geojson`
      const res = await fetch(url)
      const data = await res.json()

      if (data.code !== 'Ok') throw new Error('Route not found')

      const route = data.routes[0]
      const coords = route.geometry.coordinates.map(c => [c[1], c[0]])

      const routeLayer = L.default.polyline(coords, {
        color: color,
        weight: 5,
        opacity: 0.85,
        dashArray: mode === 'walking' ? '8, 8' : null,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map)

      routeLayerRef.current = routeLayer
      map.fitBounds(routeLayer.getBounds(), { padding: [60, 60] })

      // Invalidate size after route drawn
      setTimeout(() => map.invalidateSize(), 200)

      const distance = (route.distance / 1000).toFixed(1)
      const duration = Math.round(route.duration / 60)
      setRouteInfo({ distance, duration, mode })
    } catch {
      alert('Could not get route. Try a different travel mode!')
    } finally {
      setLoadingRoute(false)
    }
  }

  async function handleModeChange(mode) {
    setTravelMode(mode)
    if (selectedPlace && mapInstanceRef.current) {
      import('leaflet').then((L) => {
        drawRoute(L, mapInstanceRef.current, lat, lon, selectedPlace.lat, selectedPlace.lon, mode)
      })
    }
  }

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>

      {/* Travel mode buttons */}
      <div style={{
        position: 'absolute', top: '10px', right: '10px',
        zIndex: 1000, display: 'flex', gap: '6px',
        background: 'rgba(10,10,10,0.85)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '14px', padding: '6px',
      }}>
        {[
          { id: 'driving', emoji: '🚗', label: 'Drive' },
          { id: 'walking', emoji: '🚶', label: 'Walk'  },
          { id: 'cycling', emoji: '🚴', label: 'Cycle' },
        ].map(m => (
          <button key={m.id} onClick={() => handleModeChange(m.id)} style={{
            padding: '6px 10px', borderRadius: '10px', border: 'none',
            cursor: 'pointer', fontSize: '12px', fontWeight: '600',
            transition: 'all 0.2s',
            background: travelMode === m.id ? color : 'transparent',
            color: travelMode === m.id ? '#fff' : '#9ca3af',
          }}>
            {m.emoji} {m.label}
          </button>
        ))}
      </div>

      {/* Route info */}
      {routeInfo && (
        <div style={{
          position: 'absolute', bottom: '10px', left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: 'rgba(10,10,10,0.9)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${color}40`,
          borderRadius: '16px', padding: '10px 20px',
          display: 'flex', gap: '20px', alignItems: 'center',
          boxShadow: `0 4px 20px ${color}30`,
          whiteSpace: 'nowrap',
        }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#fff', fontSize: '16px', fontWeight: '700', margin: 0 }}>{routeInfo.distance} km</p>
            <p style={{ color: '#6b7280', fontSize: '11px', margin: 0 }}>Distance</p>
          </div>
          <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#fff', fontSize: '16px', fontWeight: '700', margin: 0 }}>{routeInfo.duration} min</p>
            <p style={{ color: '#6b7280', fontSize: '11px', margin: 0 }}>Est. time</p>
          </div>
          <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: color, fontSize: '16px', margin: 0 }}>
              {routeInfo.mode === 'driving' ? '🚗' : routeInfo.mode === 'walking' ? '🚶' : '🚴'}
            </p>
            <p style={{ color: '#6b7280', fontSize: '11px', margin: 0, textTransform: 'capitalize' }}>{routeInfo.mode}</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loadingRoute && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          background: 'rgba(10,10,10,0.9)',
          borderRadius: '16px', padding: '16px 24px',
          color: '#fff', fontSize: '13px',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <div style={{
            width: '16px', height: '16px',
            border: '2px solid rgba(255,255,255,0.2)',
            borderTop: `2px solid ${color}`,
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          Getting route...
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      <div ref={mapRef} style={{ height: '100%', width: '100%', borderRadius: '16px' }} />
    </div>
  )
}