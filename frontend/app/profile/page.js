'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

const BADGES = [
  { id: 'explorer',    emoji: '🗺️', label: 'Explorer',      desc: 'Visited 5+ places',      unlocked: true  },
  { id: 'foodie',      emoji: '🍜', label: 'Foodie',         desc: 'Found 3 food spots',     unlocked: true  },
  { id: 'nightowl',    emoji: '🦉', label: 'Night Owl',      desc: 'Explored after 10pm',    unlocked: true  },
  { id: 'adventurer',  emoji: '⛰️', label: 'Adventurer',     desc: 'Tried adventure mood',   unlocked: false },
  { id: 'romantic',    emoji: '💘', label: 'Romantic',       desc: 'Found romantic spots',   unlocked: false },
  { id: 'cafehunter',  emoji: '☕', label: 'Cafe Hunter',    desc: 'Visited 5 cafes',        unlocked: false },
  { id: 'socialite',   emoji: '🎉', label: 'Socialite',      desc: 'Used social mood 5x',    unlocked: false },
  { id: 'culturevulture', emoji: '🏛️', label: 'Culture Vulture', desc: 'Visited 3 museums', unlocked: false },
]

const MOOD_HISTORY = [
  { mood: 'coffee',    emoji: '☕', color: '#d97706', count: 8  },
  { mood: 'foodie',    emoji: '🍜', color: '#eab308', count: 6  },
  { mood: 'relaxing',  emoji: '🌿', color: '#22c55e', count: 5  },
  { mood: 'social',    emoji: '🎉', color: '#a855f7', count: 4  },
  { mood: 'adventure', emoji: '⛰️', color: '#f97316', count: 3  },
  { mood: 'culture',   emoji: '🏛️', color: '#3b82f6', count: 2  },
]

export default function Profile() {
  const router = useRouter()
  const fileRef = useRef(null)
  const [editing, setEditing] = useState(false)
  const [avatar, setAvatar] = useState(null)
  const [profile, setProfile] = useState({
    name: 'Manan Awasthi',
    email: 'mananawasthi2005@gmail.com',
    bio: 'Explorer of vibes 🌿 Finding the best spots in town!',
    city: 'Ludhiana, Punjab',
  })
  const [tempProfile, setTempProfile] = useState(profile)

  function handleAvatarChange(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setAvatar(reader.result)
    reader.readAsDataURL(file)
  }

  function saveProfile() {
    setProfile(tempProfile)
    setEditing(false)
  }

  const totalMoods = MOOD_HISTORY.reduce((a, b) => a + b.count, 0)
  const maxCount = Math.max(...MOOD_HISTORY.map(m => m.count))

  return (
    <main style={{ minHeight: '100vh', background: '#050508' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-green {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
        }
        .fade-up { animation: fadeUp 0.5s ease both; }
        .badge-card:hover { transform: translateY(-3px); }
        .edit-input:focus { border-color: rgba(34,197,94,0.5) !important; outline: none; }
      `}</style>

      {/* Background */}
      <div style={{
        position: 'fixed', top: '-20%', right: '-10%',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '460px', margin: '0 auto', padding: '2rem 1rem' }}>

        {/* Header */}
        <div className="fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h1 style={{
            fontFamily: 'var(--font-clash)', fontSize: '28px', fontWeight: '700',
            background: 'linear-gradient(135deg, #22c55e, #fff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            My Profile
          </h1>
          <button onClick={() => { setEditing(!editing); setTempProfile(profile) }} style={{
            padding: '8px 16px', borderRadius: '12px', cursor: 'pointer',
            background: editing ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
            border: `1px solid ${editing ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
            color: editing ? '#ef4444' : '#22c55e',
            fontSize: '13px', fontWeight: '600', transition: 'all 0.2s',
          }}>
            {editing ? '✕ Cancel' : '✏️ Edit'}
          </button>
        </div>

        {/* Profile Card */}
        <div className="fade-up" style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px', padding: '24px', marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '24px',
                background: avatar ? 'none' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '32px', overflow: 'hidden',
                border: '2px solid rgba(34,197,94,0.3)',
                animation: 'pulse-green 3s ease-in-out infinite',
              }}>
                {avatar
                  ? <img src={avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : '😊'}
              </div>
              {editing && (
                <button onClick={() => fileRef.current?.click()} style={{
                  position: 'absolute', bottom: '-6px', right: '-6px',
                  width: '26px', height: '26px', borderRadius: '50%',
                  background: '#22c55e', border: '2px solid #050508',
                  cursor: 'pointer', fontSize: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  📷
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*"
                onChange={handleAvatarChange} style={{ display: 'none' }} />
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {editing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    className="edit-input"
                    value={tempProfile.name}
                    onChange={e => setTempProfile({ ...tempProfile, name: e.target.value })}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px', padding: '8px 12px',
                      color: '#fff', fontSize: '15px', fontWeight: '600',
                      width: '100%', boxSizing: 'border-box',
                    }}
                  />
                  <input
                    className="edit-input"
                    value={tempProfile.city}
                    onChange={e => setTempProfile({ ...tempProfile, city: e.target.value })}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px', padding: '8px 12px',
                      color: '#9ca3af', fontSize: '13px',
                      width: '100%', boxSizing: 'border-box',
                    }}
                  />
                </div>
              ) : (
                <>
                  <p style={{ color: '#f3f4f6', fontSize: '18px', fontWeight: '700', marginBottom: '2px' }}>
                    {profile.name}
                  </p>
                  <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '4px' }}>
                    📍 {profile.city}
                  </p>
                  <p style={{ color: '#9ca3af', fontSize: '12px' }}>
                    {profile.email}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Bio */}
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {editing ? (
              <textarea
                className="edit-input"
                value={tempProfile.bio}
                onChange={e => setTempProfile({ ...tempProfile, bio: e.target.value })}
                rows={2}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', padding: '10px 12px',
                  color: '#d1d5db', fontSize: '13px', resize: 'none',
                  boxSizing: 'border-box', fontFamily: 'var(--font-satoshi)',
                }}
              />
            ) : (
              <p style={{ color: '#9ca3af', fontSize: '13px', lineHeight: '1.6' }}>
                {profile.bio}
              </p>
            )}
          </div>

          {/* Save button */}
          {editing && (
            <button onClick={saveProfile} style={{
              width: '100%', marginTop: '14px', padding: '12px',
              borderRadius: '14px', border: 'none',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: '#fff', fontSize: '14px', fontWeight: '700',
              cursor: 'pointer', transition: 'all 0.2s',
            }}>
              💾 Save Profile
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="fade-up" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px', marginBottom: '16px',
        }}>
          {[
            { label: 'Places Found',  value: totalMoods, emoji: '📍' },
            { label: 'Places Saved',  value: 12,         emoji: '❤️' },
            { label: 'Moods Used',    value: 6,          emoji: '😊' },
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '18px', padding: '16px 8px',
              textAlign: 'center',
              animation: `fadeUp 0.4s ${i * 0.1}s ease both`,
            }}>
              <div style={{ fontSize: '22px', marginBottom: '4px' }}>{stat.emoji}</div>
              <div style={{ color: '#fff', fontSize: '22px', fontWeight: '700' }}>{stat.value}</div>
              <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '2px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Mood History Chart */}
        <div className="fade-up" style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '24px', padding: '20px', marginBottom: '16px',
        }}>
          <p style={{ color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
            Mood History
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {MOOD_HISTORY.map((m, i) => (
              <div key={m.mood} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                animation: `fadeUp 0.4s ${i * 0.08}s ease both`,
              }}>
                <span style={{ fontSize: '16px', width: '24px' }}>{m.emoji}</span>
                <span style={{ color: '#9ca3af', fontSize: '12px', width: '70px', textTransform: 'capitalize' }}>
                  {m.mood}
                </span>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '20px', height: '8px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '20px',
                    background: m.color,
                    width: `${(m.count / maxCount) * 100}%`,
                    transition: 'width 1s ease',
                    boxShadow: `0 0 8px ${m.color}60`,
                  }} />
                </div>
                <span style={{ color: '#6b7280', fontSize: '12px', width: '20px', textAlign: 'right' }}>
                  {m.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Badges */}
        <div className="fade-up" style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '24px', padding: '20px', marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Badges & Achievements
            </p>
            <span style={{ color: '#22c55e', fontSize: '12px' }}>
              {BADGES.filter(b => b.unlocked).length}/{BADGES.length} unlocked
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {BADGES.map((badge, i) => (
              <div key={badge.id}
                className="badge-card"
                title={badge.desc}
                style={{
                  borderRadius: '16px', padding: '12px 6px',
                  textAlign: 'center', cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: badge.unlocked ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.02)',
                  border: badge.unlocked ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(255,255,255,0.05)',
                  opacity: badge.unlocked ? 1 : 0.4,
                  animation: `fadeUp 0.4s ${i * 0.05}s ease both`,
                }}>
                <div style={{ fontSize: '24px', marginBottom: '4px', filter: badge.unlocked ? 'none' : 'grayscale(1)' }}>
                  {badge.emoji}
                </div>
                <div style={{ fontSize: '9px', color: badge.unlocked ? '#22c55e' : '#4b5563', fontWeight: '600', lineHeight: '1.3' }}>
                  {badge.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button onClick={() => router.push('/login')} style={{
          width: '100%', padding: '14px', borderRadius: '16px',
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.15)',
          color: '#ef4444', fontSize: '14px', fontWeight: '600',
          cursor: 'pointer', transition: 'all 0.2s',
          marginBottom: '16px',
        }}>
          🚪 Sign Out
        </button>

      </div>
    </main>
  )
}