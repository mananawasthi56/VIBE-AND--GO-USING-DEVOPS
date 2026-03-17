import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'Vibe & Go — Find places that match your mood',
  description: 'Discover the best spots around you based on how you feel right now.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="mesh-bg min-h-screen antialiased" style={{ paddingBottom: '90px' }}>
        {children}
        <Navbar />
      </body>
    </html>
  )
}