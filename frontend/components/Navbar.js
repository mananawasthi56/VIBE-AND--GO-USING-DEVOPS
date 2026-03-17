'use client'
import { usePathname, useRouter } from 'next/navigation'

const TABS = [
  { id: '/',        icon: '🏠', label: 'Home'    },
  { id: '/saved',   icon: '❤️', label: 'Saved'   },
  { id: '/feed',    icon: '📸', label: 'Feed'    },
  { id: '/journal', icon: '📓', label: 'Journal' },
  { id: '/profile', icon: '👤', label: 'Profile' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()

  if (pathname.startsWith('/results') || pathname.startsWith('/login')) return null

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      zIndex: 100, padding: '0 1rem 1rem',
    }}>
      <div style={{
        maxWidth: '460px', margin: '0 auto',
        background: 'rgba(10,10,10,0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '24px',
        display: 'flex', alignItems: 'center',
        padding: '8px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}>
        {TABS.map(tab => {
          const isActive = pathname === tab.id
          return (
            <button key={tab.id}
              onClick={() => router.push(tab.id)}
              style={{
                flex: 1, padding: '10px 4px',
                borderRadius: '16px', border: 'none',
                cursor: 'pointer', transition: 'all 0.2s',
                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '3px',
              }}>
              <span style={{ fontSize: '18px' }}>{tab.icon}</span>
              <span style={{
                fontSize: '9px', fontWeight: '500',
                color: isActive ? '#fff' : '#4b5563',
                transition: 'color 0.2s',
              }}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}