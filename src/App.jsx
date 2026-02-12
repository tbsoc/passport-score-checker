import React from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import PassportChecker from './components/PassportChecker'

function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
      padding: '24px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      <div style={{ maxWidth: '460px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
          <ConnectButton showBalance={false} />
        </div>
        <PassportChecker />
        <p style={{ textAlign: 'center', marginTop: '24px', color: 'rgba(255,255,255,0.6)', fontSize: '13px', letterSpacing: '0.01em' }}>
          Powered by <a href="https://passport.xyz" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontWeight: 500 }}>Human Passport</a>
        </p>
      </div>
    </div>
  )
}

export default App