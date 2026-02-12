import React, { useState } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import StampEmbed from './StampEmbed'

const API_KEY = 'aHQTZ9NL.Qc2OJVPJqk7KTT8Meugg0x6yuZ4ETsjR'
const SCORER_ID = '11930'
const API_BASE_URL = 'https://api.passport.xyz'
const THRESHOLD = 20

const card = {
  background: 'white',
  borderRadius: '16px',
  padding: '36px 32px',
  textAlign: 'center',
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
}

function PassportChecker() {
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  
  const [score, setScore] = useState(null)
  const [isHuman, setIsHuman] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showEmbed, setShowEmbed] = useState(false)
  const [manualAddress, setManualAddress] = useState('')
  const [stampCount, setStampCount] = useState(0)

  const signMessage = async (message) => {
    return await signMessageAsync({ message })
  }

  const checkPassport = async () => {
    const addr = (address || manualAddress || '').trim()
    if (!addr) {
      setError('Please connect your wallet or enter an Ethereum address')
      return
    }
    
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `${API_BASE_URL}/v2/stamps/${SCORER_ID}/score/${addr}`,
        {
          headers: {
            'X-API-KEY': API_KEY,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('No Passport found. Create one at app.passport.xyz')
        }
        throw new Error('API error')
      }

      const data = await response.json()
      const userScore = parseFloat(data.score)
      const passing = userScore >= THRESHOLD
      
      setScore(userScore.toFixed(2))
      setIsHuman(passing)
      setStampCount(data.stamp_scores ? Object.keys(data.stamp_scores).length : 0)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div style={card}>
        <h1 style={{ color: '#1a1a2e', marginBottom: '8px', fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em' }}>
          Passport Score Checker
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '14px', lineHeight: 1.5 }}>
          Connect your wallet to check your score, or enter an address below.
        </p>
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <input
            placeholder="0x..."
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1.5px solid #e5e7eb',
              fontSize: '14px',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
          />
          <button
            onClick={checkPassport}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: 'none',
              background: '#4f46e5',
              color: 'white',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Check
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={card}>
      <h1 style={{ color: '#1a1a2e', marginBottom: '6px', fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em' }}>
        Passport Score Checker
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '14px', lineHeight: 1.5 }}>
        Verify your on-chain humanity
      </p>

      <button 
        onClick={checkPassport}
        disabled={loading}
        style={{
          background: '#4f46e5',
          color: 'white',
          padding: '12px 28px',
          border: 'none',
          borderRadius: '10px',
          fontSize: '15px',
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          fontFamily: 'inherit',
          transition: 'opacity 0.2s',
        }}
      >
        {loading ? 'Checking...' : 'Check Score'}
      </button>

      {loading && (
        <p style={{ color: '#6b7280', marginTop: '16px', fontSize: '14px' }}>Looking up your Passport...</p>
      )}

      {score !== null && !loading && (
        <div style={{
          marginTop: '24px',
          padding: '24px 20px',
          borderRadius: '12px',
          background: isHuman ? '#ecfdf5' : '#fef2f2',
          border: `1.5px solid ${isHuman ? '#6ee7b7' : '#fca5a5'}`
        }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>{isHuman ? '✅' : '🤖'}</div>
          <h2 style={{ color: isHuman ? '#065f46' : '#991b1b', marginBottom: '6px', fontSize: '18px', fontWeight: 700 }}>
            {isHuman ? 'You are a human' : 'Possibly a robot'}
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '13px', lineHeight: 1.5 }}>
            {isHuman 
              ? 'Your Passport score meets the threshold.'
              : 'Your score is below the threshold. Add stamps to increase it.'}
          </p>
          <div style={{ background: 'rgba(255,255,255,0.7)', padding: '16px', borderRadius: '10px' }}>
            <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#9ca3af', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Score</p>
            <p style={{ fontSize: '36px', fontWeight: 700, color: '#1a1a2e', margin: '0 0 4px', letterSpacing: '-0.02em' }}>{score}</p>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Threshold: {THRESHOLD}</p>
            {stampCount > 0 && <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>{stampCount} stamps verified</p>}
          </div>
          
          <button 
            onClick={() => setShowEmbed(true)}
            style={{
              background: isHuman ? '#059669' : '#4f46e5',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              marginTop: '16px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              fontFamily: 'inherit',
              transition: 'opacity 0.2s',
            }}
          >
            {isHuman ? 'Add More Stamps' : 'Increase Score'}
          </button>
        </div>
      )}

      {error && (
        <div style={{
          marginTop: '20px',
          padding: '12px 16px',
          background: '#fffbeb',
          border: '1.5px solid #fcd34d',
          borderRadius: '10px',
          color: '#92400e',
          fontSize: '13px',
        }}>
          {error}
        </div>
      )}

      {showEmbed && (
        <StampEmbed
          address={address}
          signMessage={signMessage}
          onClose={() => setShowEmbed(false)}
          onScoreUpdate={() => {
            setShowEmbed(false)
            checkPassport()
          }}
        />
      )}
    </div>
  )
}

export default PassportChecker