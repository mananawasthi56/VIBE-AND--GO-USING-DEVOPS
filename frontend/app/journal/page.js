'use client'
import { useState, useEffect } from 'react'

const MOODS = [
  { id: 'happy',     emoji: '😄', label: 'Happy',     color: '#eab308' },
  { id: 'peaceful',  emoji: '😌', label: 'Peaceful',  color: '#22c55e' },
  { id: 'romantic',  emoji: '🥰', label: 'Romantic',  color: '#ec4899' },
  { id: 'excited',   emoji: '🤩', label: 'Excited',   color: '#f97316' },
  { id: 'lonely',    emoji: '😔', label: 'Lonely',    color: '#3b82f6' },
  { id: 'anxious',   emoji: '😰', label: 'Anxious',   color: '#a855f7' },
  { id: 'grateful',  emoji: '🙏', label: 'Grateful',  color: '#10b981' },
  { id: 'bored',     emoji: '😑', label: 'Bored',     color: '#6b7280' },
]

export default function Journal() {
  const [entries, setEntries] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ mood: '', place: '', note: '' })

  useEffect(() => {
    const saved = localStorage.getItem('vibe-journal')
    if (saved) setEntries(JSON.parse(saved))
  }, [])

  function saveEntry() {
    if (!form.mood || !form.note) return
    const entry = {
      id: Date.now(),
      ...form,
      date: new Date().toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      }),
      time: new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit',
      }),
    }
    const updated = [entry, ...entries]
    setEntries(updated)
    localStorage.setItem('vibe-journal', JSON.stringify(updated))
    setForm({ mood: '', place: '', note: '' })
    setShowForm(false)
  }

  function deleteEntry(id) {
    const updated = entries.filter(e => e.id !== id)
    setEntries(updated)
    localStorage.setItem('vibe-journal', JSON.stringify(updated))
  }

  const selectedMood = MOODS.find(m => m.id === form.mood)

  return (
    <main style={{ minHeight: '100vh', background: '#050508' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.5s ease both; }
        .entry-card:hover { border-color: rgba(255,255,255,0.12) !important; }
      `}</style>

      {/* Background glow */}
      <div style={{
        position: 'fixed', bottom: '-10%', right: '-10%',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '460px', margin: '0 auto', padding: '2rem 1rem' }}>

        {/* Header */}
        <div className="fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-clash)',
              fontSize: '36px', fontWeight: '700',
              background: 'linear-gradient(135deg, #10b981, #fff)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Mood Journal 📓
            </h1>
            <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px' }}>
              Record your mood & place memories
            </p>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={{
            padding: '10px 16px', borderRadius: '14px',
            background: 'rgba(16,185,129,0.2)',
            border: '1px solid rgba(16,185,129,0.3)',
            color: '#10b981', fontSize: '13px', fontWeight: '600',
            cursor: 'pointer',
          }}>
            + Add
          </button>
        </div>

        {/* New Entry Form */}
        {showForm && (
          <div className="fade-up" style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px', padding: '20px', marginBottom: '20px',
          }}>
            <p style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              New Entry
            </p>

            {/* Mood selector */}
            <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '8px' }}>How are you feeling?</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '14px' }}>
              {MOODS.map(m => (
                <button key={m.id} onClick={() => setForm({ ...form, mood: m.id })} style={{
                  padding: '10px 4px', borderRadius: '14px', border: '1px solid',
                  borderColor: form.mood === m.id ? m.color : 'rgba(255,255,255,0.08)',
                  background: form.mood === m.id ? `${m.color}18` : 'rgba(255,255,255,0.03)',
                  cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                }}>
                  <div style={{ fontSize: '20px' }}>{m.emoji}</div>
                  <div style={{ fontSize: '10px', color: form.mood === m.id ? m.color : '#6b7280', marginTop: '2px' }}>
                    {m.label}
                  </div>
                </button>
              ))}
            </div>

            <input
              value={form.place}
              onChange={e => setForm({ ...form, place: e.target.value })}
              placeholder="📍 Where are you? (optional)"
              style={{
                width: '100%', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', padding: '10px 14px',
                color: '#fff', fontSize: '13px', outline: 'none',
                marginBottom: '8px', boxSizing: 'border-box',
              }}
            />
            <textarea
              value={form.note}
              onChange={e => setForm({ ...form, note: e.target.value })}
              placeholder="How do you feel? What happened today?..."
              style={{
                width: '100%', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', padding: '10px 14px',
                color: '#fff', fontSize: '13px', outline: 'none',
                resize: 'none', marginBottom: '12px', boxSizing: 'border-box',
                fontFamily: 'var(--font-satoshi)',
              }}
              rows={3}
            />
            <button onClick={saveEntry} style={{
              width: '100%', padding: '12px', borderRadius: '12px',
              border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
              background: selectedMood
                ? `linear-gradient(135deg, ${selectedMood.color}, ${selectedMood.color}88)`
                : 'rgba(255,255,255,0.05)',
              color: selectedMood ? '#fff' : '#4b5563',
            }}>
              Save Entry 📝
            </button>
          </div>
        )}

        {/* Empty state */}
        {entries.length === 0 && !showForm && (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📓</div>
            <p style={{ color: '#6b7280', fontSize: '15px', fontWeight: '500' }}>No journal entries yet</p>
            <p style={{ color: '#4b5563', fontSize: '13px', marginTop: '6px' }}>
              Start recording your mood memories!
            </p>
            <button onClick={() => setShowForm(true)} style={{
              marginTop: '20px', padding: '12px 24px',
              borderRadius: '14px', fontSize: '14px', fontWeight: '600',
              background: 'rgba(16,185,129,0.2)',
              border: '1px solid rgba(16,185,129,0.3)',
              color: '#10b981', cursor: 'pointer',
            }}>
              Write First Entry ✍️
            </button>
          </div>
        )}

        {/* Entries */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {entries.map((entry, i) => {
            const moodInfo = MOODS.find(m => m.id === entry.mood) || { emoji: '😊', color: '#22c55e' }
            return (
              <div key={entry.id}
                className="entry-card"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '20px', padding: '16px',
                  transition: 'all 0.2s',
                  animation: `fadeUp 0.4s ${i * 0.06}s ease both`,
                }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '22px', flexShrink: 0,
                    background: `${moodInfo.color}18`,
                    border: `1px solid ${moodInfo.color}25`,
                  }}>
                    {moodInfo.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{
                        fontSize: '12px', padding: '2px 10px', borderRadius: '20px',
                        background: `${moodInfo.color}18`, color: moodInfo.color,
                        border: `1px solid ${moodInfo.color}25`,
                      }}>
                        {moodInfo.label}
                      </span>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ color: '#4b5563', fontSize: '11px' }}>{entry.date} · {entry.time}</span>
                        <button onClick={() => deleteEntry(entry.id)} style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: '#4b5563', fontSize: '14px',
                        }}>🗑️</button>
                      </div>
                    </div>
                    {entry.place && (
                      <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '6px' }}>
                        📍 {entry.place}
                      </p>
                    )}
                    <p style={{ color: '#d1d5db', fontSize: '14px', lineHeight: '1.6' }}>
                      {entry.note}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </main>
  )
}