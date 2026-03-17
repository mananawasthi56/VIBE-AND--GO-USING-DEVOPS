'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Login() {
  const router = useRouter()
  const [step, setStep] = useState('login')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [particles, setParticles] = useState([])
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    setParticles(Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 10 + 8,
      delay: Math.random() * 5,
    })))
  }, [])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  async function handleSendOTP() {
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStep('otp')
      setSuccess(`OTP sent to ${email}!`)
      setCountdown(60)
    } catch (err) {
      setError(err.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOTP() {
    const otpValue = otp.join('')
    if (otpValue.length !== 6) {
      setError('Please enter the complete 6-digit OTP')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/send-otp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpValue }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSuccess('Email verified! Redirecting...')
      setTimeout(() => router.push('/'), 1500)
    } catch (err) {
      setError(err.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  function handleOtpChange(index, value) {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  function handleOtpKeyDown(index, e) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus()
    }
  }

  function handleOtpPaste(e) {
    const pasted = e.clipboardData.getData('text').slice(0, 6)
    if (/^\d+$/.test(pasted)) {
      const newOtp = pasted.split('').concat(Array(6).fill('')).slice(0, 6)
      setOtp(newOtp)
    }
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#050508',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: '1rem',
    }}>

      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, 40px) scale(1.1); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-40px, -30px) scale(1.05); }
        }
        @keyframes particle {
          0% { transform: translate(0, 0); opacity: 0.2; }
          100% { transform: translate(20px, -30px); opacity: 0.5; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-green {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
          50% { box-shadow: 0 0 0 12px rgba(34,197,94,0); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .fade-up { animation: fadeUp 0.6s ease both; }
        .slide-in { animation: slideIn 0.4s ease both; }
        .otp-input:focus {
          border-color: #22c55e !important;
          box-shadow: 0 0 0 3px rgba(34,197,94,0.2) !important;
          transform: scale(1.05);
        }
        .primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(34,197,94,0.5) !important;
        }
        .primary-btn:active { transform: scale(0.98); }
        .email-input:focus {
          border-color: rgba(34,197,94,0.5) !important;
          box-shadow: 0 0 0 3px rgba(34,197,94,0.1) !important;
        }
      `}</style>

      {/* Animated background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)',
          animation: 'float1 12s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-10%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)',
          animation: 'float2 15s ease-in-out infinite',
        }} />
        {particles.map(p => (
          <div key={p.id} style={{
            position: 'absolute',
            left: `${p.x}%`, top: `${p.y}%`,
            width: `${p.size}px`, height: `${p.size}px`,
            borderRadius: '50%', background: '#22c55e', opacity: 0.2,
            animation: `particle ${p.duration}s ${p.delay}s ease-in-out infinite alternate`,
          }} />
        ))}
      </div>

      {/* Login Card */}
      <div style={{
        width: '100%', maxWidth: '420px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '28px', padding: '40px 32px',
        backdropFilter: 'blur(20px)',
        position: 'relative', zIndex: 1,
        boxShadow: '0 32px 64px rgba(0,0,0,0.5)',
      }}>

        {/* Logo */}
        <div className="fade-up" style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '22px',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '32px', margin: '0 auto 20px',
            boxShadow: '0 8px 32px rgba(34,197,94,0.4)',
            animation: 'pulse-green 3s ease-in-out infinite',
          }}>
            🗺️
          </div>
          <h1 style={{
            fontFamily: 'var(--font-clash)',
            fontSize: '30px', fontWeight: '700',
            background: 'linear-gradient(135deg, #22c55e, #fff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            margin: '0 0 6px',
          }}>
            {step === 'login' ? 'Welcome to Vibe & Go' : 'Check your email'}
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.5' }}>
            {step === 'login'
              ? 'Enter your email to get started 🚀'
              : `We sent a 6-digit code to\n${email}`}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '12px', padding: '12px 16px',
            color: '#ef4444', fontSize: '13px', marginBottom: '16px',
            animation: 'fadeUp 0.3s ease both',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div style={{
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: '12px', padding: '12px 16px',
            color: '#22c55e', fontSize: '13px', marginBottom: '16px',
            animation: 'fadeUp 0.3s ease both',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            ✅ {success}
          </div>
        )}

        {/* Login Step */}
        {step === 'login' && (
          <div className="fade-up">
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                color: '#9ca3af', fontSize: '12px',
                display: 'block', marginBottom: '8px',
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                Email address
              </label>
              <input
                className="email-input"
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '14px', padding: '14px 16px',
                  color: '#fff', fontSize: '15px', outline: 'none',
                  boxSizing: 'border-box', transition: 'all 0.2s',
                  fontFamily: 'var(--font-satoshi)',
                }}
              />
            </div>

            <button
              className="primary-btn"
              onClick={handleSendOTP}
              disabled={loading}
              style={{
                width: '100%', padding: '15px',
                borderRadius: '16px', border: 'none',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: '#fff', fontSize: '15px', fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '8px',
                boxShadow: '0 4px 24px rgba(34,197,94,0.35)',
                letterSpacing: '0.02em',
              }}>
              {loading ? (
                <>
                  <div style={{
                    width: '18px', height: '18px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid #fff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                  Sending OTP...
                </>
              ) : '📧 Send OTP Code →'}
            </button>
          </div>
        )}

        {/* OTP Step */}
        {step === 'otp' && (
          <div className="slide-in">
            <p style={{ color: '#6b7280', fontSize: '13px', textAlign: 'center', marginBottom: '20px' }}>
              Sent to <strong style={{ color: '#fff' }}>{email}</strong>
            </p>

            {/* OTP inputs */}
            <div style={{
              display: 'flex', gap: '10px',
              justifyContent: 'center', marginBottom: '24px',
            }}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  className="otp-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value.replace(/\D/g, ''))}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  onPaste={handleOtpPaste}
                  style={{
                    width: '52px', height: '60px',
                    background: digit ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)',
                    border: digit ? '1.5px solid #22c55e' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px', textAlign: 'center',
                    color: '#fff', fontSize: '24px', fontWeight: '700',
                    outline: 'none', transition: 'all 0.2s',
                    caretColor: '#22c55e',
                  }}
                />
              ))}
            </div>

            {/* Verify Button */}
            <button
              className="primary-btn"
              onClick={handleVerifyOTP}
              disabled={loading}
              style={{
                width: '100%', padding: '15px',
                borderRadius: '16px', border: 'none',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: '#fff', fontSize: '15px', fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s', marginBottom: '16px',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '8px',
                boxShadow: '0 4px 24px rgba(34,197,94,0.35)',
              }}>
              {loading ? (
                <>
                  <div style={{
                    width: '18px', height: '18px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid #fff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                  Verifying...
                </>
              ) : '✅ Verify & Enter →'}
            </button>

            {/* Resend */}
            <div style={{ textAlign: 'center' }}>
              {countdown > 0 ? (
                <p style={{ color: '#6b7280', fontSize: '13px' }}>
                  Resend in <strong style={{ color: '#22c55e' }}>{countdown}s</strong>
                </p>
              ) : (
                <button
                  onClick={() => {
                    setStep('login')
                    setOtp(['', '', '', '', '', ''])
                    setError('')
                    setSuccess('')
                  }}
                  style={{
                    background: 'none', border: 'none',
                    cursor: 'pointer', color: '#22c55e',
                    fontSize: '13px', fontWeight: '500',
                  }}>
                  ← Change email or resend
                </button>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <p style={{
          color: '#4b5563', fontSize: '11px',
          textAlign: 'center', marginTop: '28px',
          lineHeight: '1.5',
        }}>
          By continuing you agree to our<br />
          Terms of Service & Privacy Policy
        </p>

      </div>
    </main>
  )
}