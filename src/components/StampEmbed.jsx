import React, { useState, useEffect, useCallback } from 'react'
import { PassportScoreWidget, DarkTheme, usePassportScore, useVerifyCredentials } from '@human.tech/passport-embed'

const EMBED_API_KEY = '9sf832PK.DS1FgQ8q7wBybAr5EbIMieffTIZYLP2T'
const SCORER_ID = '11930'
const EMBED_SERVICE_URL = 'https://embed.passport.xyz'

// Custom stamp list for passing users
function StampList({ address, signMessage, onScoreUpdate }) {
  const [stamps, setStamps] = useState([])
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(null)
  const [error, setError] = useState(null)

  const { data: scoreData, refetch } = usePassportScore({
    apiKey: EMBED_API_KEY,
    address,
    scorerId: SCORER_ID,
    embedServiceUrl: EMBED_SERVICE_URL,
  })

  const { verifyCredentials } = useVerifyCredentials({
    apiKey: EMBED_API_KEY,
    address,
    scorerId: SCORER_ID,
    embedServiceUrl: EMBED_SERVICE_URL,
  })

  // Fetch stamp metadata
  useEffect(() => {
    async function fetchStamps() {
      try {
        const res = await fetch(
          `${EMBED_SERVICE_URL}/embed/stamps/metadata?scorerId=${SCORER_ID}`,
          { headers: { 'X-API-KEY': EMBED_API_KEY, 'Content-Type': 'application/json' } }
        )
        if (!res.ok) throw new Error('Failed to fetch stamps')
        const data = await res.json()
        // data is array of categories, each with platforms
        const allPlatforms = []
        for (const category of (data.data || data || [])) {
          for (const platform of (category.platforms || [])) {
            allPlatforms.push({
              ...platform,
              category: category.stampCategory || category.name || 'Other',
            })
          }
        }
        setStamps(allPlatforms)
      } catch (err) {
        console.error('Failed to fetch stamps:', err)
        setError('Could not load stamps')
      } finally {
        setLoading(false)
      }
    }
    fetchStamps()
  }, [])

  const handleVerify = useCallback(async (platform) => {
    const credIds = platform.credentials.map(c => c.id)
    setVerifying(platform.platformId)
    setError(null)

    try {
      if (platform.requiresPopup && platform.popupUrl) {
        // Open popup for OAuth-based stamps
        const popup = window.open(
          platform.popupUrl,
          '_blank',
          'width=600,height=700'
        )
        // Poll for popup close
        await new Promise((resolve) => {
          const interval = setInterval(() => {
            if (!popup || popup.closed) {
              clearInterval(interval)
              resolve()
            }
          }, 500)
        })
      }

      if (platform.requiresSignature && signMessage) {
        // The embed service handles signature requests internally
        // through the verifyCredentials mutation
      }

      verifyCredentials(credIds, {
        onSuccess: () => {
          refetch()
          setVerifying(null)
        },
        onError: (err) => {
          console.error('Verify error:', err)
          setError(`Failed to verify ${platform.platformId}`)
          setVerifying(null)
        },
        onSettled: () => {
          setVerifying(null)
        }
      })
    } catch (err) {
      console.error('Verify error:', err)
      setError(`Failed to verify ${platform.platformId}`)
      setVerifying(null)
    }
  }, [verifyCredentials, signMessage, refetch])

  // Check if a platform's credentials are already claimed
  const isPlatformClaimed = (platform) => {
    if (!scoreData?.stamps) return false
    return platform.credentials.some(c => {
      const stamp = scoreData.stamps[c.id]
      return stamp && stamp.score > 0
    })
  }

  const getPlatformPoints = (platform) => {
    if (!scoreData?.stamps) return 0
    return platform.credentials.reduce((sum, c) => {
      const stamp = scoreData.stamps[c.id]
      return sum + (stamp?.score || 0)
    }, 0)
  }

  if (loading) {
    return <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px', fontSize: '13px' }}>Loading available stamps...</p>
  }

  if (error && stamps.length === 0) {
    return <p style={{ color: '#991b1b', textAlign: 'center', padding: '20px', fontSize: '13px' }}>{error}</p>
  }

  // Group by category
  const grouped = stamps.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = []
    acc[s.category].push(s)
    return acc
  }, {})

  return (
    <div>
      {/* Current score display */}
      {scoreData && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          background: '#f0fdf4',
          borderRadius: '10px',
          marginBottom: '16px',
          border: '1px solid #bbf7d0',
        }}>
          <span style={{ fontSize: '13px', color: '#065f46', fontWeight: 500 }}>Your Score</span>
          <span style={{ fontSize: '18px', color: '#065f46', fontWeight: 700 }}>{scoreData.score?.toFixed(2)}</span>
        </div>
      )}

      {error && (
        <p style={{ color: '#991b1b', fontSize: '12px', marginBottom: '12px', textAlign: 'center' }}>{error}</p>
      )}

      {/* Stamp categories */}
      {Object.entries(grouped).map(([category, platforms]) => (
        <div key={category} style={{ marginBottom: '16px' }}>
          <h4 style={{
            fontSize: '11px',
            fontWeight: 600,
            color: '#9ca3af',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '8px',
          }}>
            {category}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {platforms.map(platform => {
              const claimed = isPlatformClaimed(platform)
              const points = getPlatformPoints(platform)
              const isVerifying = verifying === platform.platformId

              return (
                <button
                  key={platform.platformId}
                  onClick={() => handleVerify(platform)}
                  disabled={isVerifying}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    background: claimed ? '#f0fdf4' : '#fafafa',
                    border: `1px solid ${claimed ? '#bbf7d0' : '#e5e7eb'}`,
                    borderRadius: '10px',
                    cursor: isVerifying ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s',
                    opacity: isVerifying ? 0.6 : 1,
                  }}
                >
                  {/* Icon */}
                  {platform.icon ? (
                    <img
                      src={platform.icon}
                      alt=""
                      style={{ width: '28px', height: '28px', borderRadius: '6px', flexShrink: 0 }}
                      onError={e => e.target.style.display = 'none'}
                    />
                  ) : (
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: '#e5e7eb',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                    }}>
                      {platform.platformId?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e' }}>
                      {platform.platformId}
                    </div>
                    {platform.description && (
                      <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {platform.description}
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    {isVerifying ? (
                      <span style={{ fontSize: '11px', color: '#6b7280' }}>Verifying...</span>
                    ) : claimed ? (
                      <span style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>+{points.toFixed(1)}</span>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#6b7280' }}>Verify</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

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
            // Custom stamp list for passing users - always shows stamps
            <StampList
              address={address}
              signMessage={signMessage}
              onScoreUpdate={onScoreUpdate}
            />
          ) : (
            // Default widget for non-passing users
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
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '10px',
        }}>
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