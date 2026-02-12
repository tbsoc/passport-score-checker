import React from 'react'
import { PassportScoreWidget, DarkTheme } from '@human.tech/passport-embed'

const EMBED_API_KEY = '9sf832PK.DS1FgQ8q7wBybAr5EbIMieffTIZYLP2T'
const SCORER_ID = '11930'

function StampEmbed({ address, signMessage, isPassing, onClose, onScoreUpdate }) {
  if (!address) return null

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '20px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: 'white',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '480px',
          maxHeight: '80vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid #f0f0f0',
        }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#1a1a2e' }}>
            {isPassing ? 'Add More Stamps' : 'Increase Your Score'}
          </h3>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              color: '#9ca3af',
              border: 'none',
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
              padding: 0,
            }}
            onMouseOver={e => e.currentTarget.style.background = '#f3f4f6'}
            onMouseOut={e => e.currentTarget.style.background = 'none'}
          >
            x
          </button>
        </div>
        
        {/* Body */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
          {isPassing ? (
            /* For passing users: show dashboard link prominently since the widget only shows a success state */
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🛡️</div>
              <p style={{ color: '#1a1a2e', fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>
                You already have a passing score!
              </p>
              <p style={{ color: '#6b7280', fontSize: '13px', lineHeight: 1.6, marginBottom: '24px' }}>
                To add more stamps and increase your score further, visit the Passport Dashboard where you can verify additional credentials.
              </p>
              <a 
                href={`https://app.passport.xyz/#/dashboard/${address}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  background: '#4f46e5',
                  color: 'white',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                Open Passport Dashboard
              </a>
              <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: '16px' }}>
                After adding stamps, come back and refresh your score.
              </p>
            </div>
          ) : (
            /* For non-passing users: show the embed widget */
            <PassportScoreWidget
              apiKey={EMBED_API_KEY}
              scorerId={SCORER_ID}
              address={address}
              generateSignatureCallback={signMessage}
              theme={DarkTheme}
              collapseMode="off"
            />
          )}
        </div>

        {/* Footer */}
        <div style={{ 
          padding: '14px 20px', 
          borderTop: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: isPassing ? 'flex-end' : 'space-between',
          alignItems: 'center',
          gap: '10px',
        }}>
          {!isPassing && (
            <a 
              href={`https://app.passport.xyz/#/dashboard/${address}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{
                color: '#6b7280',
                fontSize: '12px',
                textDecoration: 'none',
                fontWeight: 500,
              }}
              onMouseOver={e => e.currentTarget.style.color = '#4f46e5'}
              onMouseOut={e => e.currentTarget.style.color = '#6b7280'}
            >
              Open Dashboard
            </a>
          )}
          <button 
            onClick={onScoreUpdate}
            style={{
              background: '#4f46e5',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              fontFamily: 'inherit',
            }}
          >
            Refresh Score
          </button>
        </div>
      </div>
    </div>
  )
}

export default StampEmbed