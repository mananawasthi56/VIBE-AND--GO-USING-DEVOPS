'use client'
import { useState, useRef, useEffect } from 'react'

const SAMPLE_POSTS = [
  { id: 1, user: 'Arjun S.', avatar: '🧑', mood: 'romantic', place: 'Sunset Point, Chandigarh', caption: 'Best sunset view in the city 🌅', likes: 24, time: '2m ago', color: '#ec4899', image: null, lat: 30.7333, lon: 76.7794 },
  { id: 2, user: 'Priya K.', avatar: '👩', mood: 'coffee', place: 'Brew & Co, Ludhiana', caption: 'Perfect chai and rainy vibes ☕🌧️', likes: 18, time: '15m ago', color: '#d97706', image: null, lat: 30.9010, lon: 75.8573 },
  { id: 3, user: 'Rahul M.', avatar: '🧔', mood: 'adventure', place: 'Rock Garden, Chandigarh', caption: 'Hidden gem! Totally worth it ⛰️', likes: 41, time: '1h ago', color: '#f97316', image: null, lat: 30.7521, lon: 76.8080 },
  { id: 4, user: 'Sneha T.', avatar: '👧', mood: 'relaxing', place: 'Rose Garden, Jalandhar', caption: 'Peaceful morning walk 🌿', likes: 33, time: '2h ago', color: '#22c55e', image: null, lat: 31.3260, lon: 75.5762 },
  { id: 5, user: 'Dev P.', avatar: '👦', mood: 'foodie', place: 'Bikanervala, Ludhiana', caption: 'Best chole bhature in town 🍛', likes: 57, time: '3h ago', color: '#eab308', image: null, lat: 30.9010, lon: 75.8573 },
]

const MOODS = [
  { id: 'adventure', emoji: '⛰️', color: '#f97316' },
  { id: 'relaxing',  emoji: '🌿', color: '#22c55e' },
  { id: 'romantic',  emoji: '🌅', color: '#ec4899' },
  { id: 'foodie',    emoji: '🍜', color: '#eab308' },
  { id: 'social',    emoji: '🎉', color: '#a855f7' },
  { id: 'culture',   emoji: '🏛️', color: '#3b82f6' },
  { id: 'shopping',  emoji: '🛍️', color: '#f43f5e' },
  { id: 'fitness',   emoji: '💪', color: '#ef4444' },
  { id: 'coffee',    emoji: '☕', color: '#d97706' },
]

export default function Feed() {
  const [posts, setPosts] = useState(SAMPLE_POSTS)
  const [liked, setLiked] = useState([])
  const [showPost, setShowPost] = useState(false)
  const [newPost, setNewPost] = useState({ caption: '', place: '', mood: 'social' })
  const [previewImage, setPreviewImage] = useState(null)
  const [showCamera, setShowCamera] = useState(false)
  const [postLocation, setPostLocation] = useState(null)
  const [locationName, setLocationName] = useState('')
  const [detectingLocation, setDetectingLocation] = useState(false)
  const fileRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  async function startCamera() {
    setShowCamera(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch {
      alert('Camera access denied! Please allow camera permission.')
      setShowCamera(false)
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setShowCamera(false)
  }

  function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    const video = videoRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    const imageData = canvas.toDataURL('image/jpeg', 0.8)
    setPreviewImage(imageData)
    stopCamera()
    detectLocation()
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setPreviewImage(reader.result)
      detectLocation()
    }
    reader.readAsDataURL(file)
  }

  async function detectLocation() {
    setDetectingLocation(true)
    try {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords
        setPostLocation({ lat: latitude, lon: longitude })
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        )
        const data = await res.json()
        const name = data.address.city || data.address.town || data.address.village || 'Unknown location'
        setLocationName(name)
        setNewPost(prev => ({ ...prev, place: name }))
        setDetectingLocation(false)
      }, () => {
        setDetectingLocation(false)
      })
    } catch {
      setDetectingLocation(false)
    }
  }

  function toggleLike(id) {
    if (liked.includes(id)) {
      setLiked(liked.filter(l => l !== id))
      setPosts(posts.map(p => p.id === id ? { ...p, likes: p.likes - 1 } : p))
    } else {
      setLiked([...liked, id])
      setPosts(posts.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p))
    }
  }

  function submitPost() {
    if (!newPost.caption) return
    const moodInfo = MOODS.find(m => m.id === newPost.mood)
    const post = {
      id: Date.now(),
      user: 'You',
      avatar: '😊',
      mood: newPost.mood,
      place: newPost.place || 'Unknown location',
      caption: newPost.caption,
      likes: 0,
      time: 'just now',
      color: moodInfo?.color || '#22c55e',
      image: previewImage,
      lat: postLocation?.lat,
      lon: postLocation?.lon,
    }
    setPosts([post, ...posts])
    setNewPost({ caption: '', place: '', mood: 'social' })
    setPreviewImage(null)
    setPostLocation(null)
    setLocationName('')
    setShowPost(false)
  }

  return (
    <main style={{ minHeight: '100vh', background: '#050508' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.5s ease both; }
        .post-card:hover { border-color: rgba(255,255,255,0.12) !important; }
      `}</style>

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Camera Modal */}
      {showCamera && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)',
          zIndex: 1000, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '20px',
        }}>
          <video ref={videoRef} autoPlay playsInline style={{
            width: '100%', maxWidth: '400px', borderRadius: '20px',
            border: '2px solid rgba(255,255,255,0.1)',
          }} />
          <div style={{ display: 'flex', gap: '16px' }}>
            <button onClick={stopCamera} style={{
              padding: '12px 24px', borderRadius: '14px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', fontSize: '14px', cursor: 'pointer',
            }}>
              ✕ Cancel
            </button>
            <button onClick={capturePhoto} style={{
              padding: '12px 32px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              border: 'none', color: '#fff', fontSize: '14px',
              fontWeight: '700', cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(34,197,94,0.4)',
            }}>
              📸 Capture
            </button>
          </div>
          <p style={{ color: '#6b7280', fontSize: '12px' }}>
            Location will be auto-detected 📍
          </p>
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '460px', margin: '0 auto', padding: '2rem 1rem' }}>

        {/* Header */}
        <div className="fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-clash)', fontSize: '36px', fontWeight: '700',
              background: 'linear-gradient(135deg, #a855f7, #fff)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Vibe Feed 📸
            </h1>
            <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px' }}>
              See what vibes people are feeling
            </p>
          </div>
          <button onClick={() => setShowPost(!showPost)} style={{
            padding: '10px 16px', borderRadius: '14px',
            background: 'rgba(168,85,247,0.2)',
            border: '1px solid rgba(168,85,247,0.3)',
            color: '#a855f7', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
          }}>
            + Post
          </button>
        </div>

        {/* New Post Form */}
        {showPost && (
          <div className="fade-up" style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px', padding: '16px', marginBottom: '20px',
          }}>
            <p style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Share your vibe
            </p>

            {/* Image preview */}
            {previewImage && (
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <img src={previewImage} alt="preview" style={{
                  width: '100%', borderRadius: '14px', maxHeight: '220px',
                  objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)',
                }} />
                <button onClick={() => setPreviewImage(null)} style={{
                  position: 'absolute', top: '8px', right: '8px',
                  background: 'rgba(0,0,0,0.7)', border: 'none',
                  color: '#fff', borderRadius: '50%', width: '28px', height: '28px',
                  cursor: 'pointer', fontSize: '14px',
                }}>✕</button>
                {locationName && (
                  <div style={{
                    position: 'absolute', bottom: '8px', left: '8px',
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
                    borderRadius: '10px', padding: '4px 10px',
                    color: '#fff', fontSize: '11px',
                    display: 'flex', alignItems: 'center', gap: '4px',
                  }}>
                    📍 {locationName}
                  </div>
                )}
              </div>
            )}

            {/* Photo buttons */}
            {!previewImage && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <button onClick={startCamera} style={{
                  flex: 1, padding: '12px', borderRadius: '14px',
                  background: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.2)',
                  color: '#22c55e', fontSize: '13px', fontWeight: '600',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '6px',
                }}>
                  📷 Camera
                </button>
                <button onClick={() => fileRef.current?.click()} style={{
                  flex: 1, padding: '12px', borderRadius: '14px',
                  background: 'rgba(168,85,247,0.1)',
                  border: '1px solid rgba(168,85,247,0.2)',
                  color: '#a855f7', fontSize: '13px', fontWeight: '600',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '6px',
                }}>
                  🖼️ Gallery
                </button>
                <input ref={fileRef} type="file" accept="image/*"
                  onChange={handleFileChange} style={{ display: 'none' }} />
              </div>
            )}

            {/* Location */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px', padding: '10px 14px', marginBottom: '8px',
            }}>
              <span style={{ fontSize: '14px' }}>📍</span>
              <input
                value={newPost.place}
                onChange={e => setNewPost({ ...newPost, place: e.target.value })}
                placeholder={detectingLocation ? 'Detecting location...' : 'Add location...'}
                style={{
                  flex: 1, background: 'none', border: 'none',
                  color: '#fff', fontSize: '13px', outline: 'none',
                }}
              />
              <button onClick={detectLocation} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#6b7280', fontSize: '12px',
              }}>
                {detectingLocation ? '...' : '🔄'}
              </button>
            </div>

            {/* Mood selector */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '8px', scrollbarWidth: 'none' }}>
              {MOODS.map(m => (
                <button key={m.id} onClick={() => setNewPost({ ...newPost, mood: m.id })} style={{
                  padding: '5px 12px', borderRadius: '20px', flexShrink: 0,
                  border: '1px solid',
                  borderColor: newPost.mood === m.id ? m.color : 'rgba(255,255,255,0.08)',
                  background: newPost.mood === m.id ? `${m.color}18` : 'transparent',
                  color: newPost.mood === m.id ? m.color : '#6b7280',
                  fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s',
                }}>
                  {m.emoji} {m.id}
                </button>
              ))}
            </div>

            <textarea
              value={newPost.caption}
              onChange={e => setNewPost({ ...newPost, caption: e.target.value })}
              placeholder="How's the vibe? 😊"
              style={{
                width: '100%', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', padding: '10px 14px',
                color: '#fff', fontSize: '13px', outline: 'none',
                resize: 'none', marginBottom: '10px', boxSizing: 'border-box',
                fontFamily: 'var(--font-satoshi)',
              }}
              rows={2}
            />

            <button onClick={submitPost} style={{
              width: '100%', padding: '12px', borderRadius: '12px',
              border: 'none', background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
              color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
            }}>
              Share Vibe ✨
            </button>
          </div>
        )}

        {/* Posts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {posts.map((post, i) => (
            <div key={post.id} className="post-card" style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '20px', overflow: 'hidden',
              transition: 'all 0.2s',
              animation: `fadeUp 0.4s ${i * 0.07}s ease both`,
            }}>
              {/* Post image */}
              {post.image && (
                <div style={{ position: 'relative' }}>
                  <img src={post.image} alt="post" style={{
                    width: '100%', maxHeight: '240px', objectFit: 'cover',
                  }} />
                  {post.lat && (
                    <div style={{
                      position: 'absolute', bottom: '8px', left: '8px',
                      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
                      borderRadius: '10px', padding: '4px 10px',
                      color: '#fff', fontSize: '11px',
                    }}>
                      📍 {post.place}
                    </div>
                  )}
                </div>
              )}

              <div style={{ padding: '14px' }}>
                {/* Post header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '50%',
                    background: `${post.color}22`, border: `1px solid ${post.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                  }}>
                    {post.avatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#f3f4f6', fontSize: '13px', fontWeight: '600' }}>{post.user}</p>
                    <p style={{ color: '#6b7280', fontSize: '11px' }}>{post.time}</p>
                  </div>
                  <span style={{
                    fontSize: '11px', padding: '3px 10px', borderRadius: '20px',
                    background: `${post.color}18`, border: `1px solid ${post.color}30`, color: post.color,
                  }}>
                    {post.mood}
                  </span>
                </div>

                {!post.image && (
                  <p style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '6px' }}>📍 {post.place}</p>
                )}
                <p style={{ color: '#e5e7eb', fontSize: '14px', lineHeight: '1.5', marginBottom: '12px' }}>
                  {post.caption}
                </p>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <button onClick={() => toggleLike(post.id)} style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: liked.includes(post.id) ? '#ec4899' : '#6b7280',
                    fontSize: '13px', transition: 'all 0.2s',
                  }}>
                    {liked.includes(post.id) ? '❤️' : '🤍'} {post.likes}
                  </button>
                  <button style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#6b7280', fontSize: '13px',
                  }}>
                    💬 Reply
                  </button>
                  {post.lat && (
                    <button
                      onClick={() => window.open(`https://www.openstreetmap.org/?mlat=${post.lat}&mlon=${post.lon}&zoom=15`, '_blank')}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#22c55e', fontSize: '13px',
                      }}>
                      🗺️ View on map
                    </button>
                  )}
                  <button style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#6b7280', fontSize: '13px', marginLeft: 'auto',
                  }}>
                    🔗 Share
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}