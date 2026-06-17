'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthForm() {
  const router = useRouter()
  const supabase = createClient()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Check your email to confirm your account.')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        router.push('/')
        router.refresh()
      }
    }
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.85rem 1.1rem',
    fontFamily: 'var(--font-garamond)',
    fontSize: '1rem',
    color: 'var(--color-obsidian)',
    backgroundColor: 'rgba(250,247,242,0.9)',
    border: '1px solid rgba(201,168,76,0.3)',
    borderRadius: '3px',
    outline: 'none',
    transition: 'border-color 0.15s',
  }

  return (
    <div style={{ maxWidth: '420px', margin: '0 auto' }}>
      {/* Mode toggle */}
      <div style={{ display: 'flex', marginBottom: '2.5rem', borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
        {(['signin', 'signup'] as const).map(m => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setError(''); setMessage('') }}
            style={{
              fontFamily: 'var(--font-garamond)',
              fontSize: '1rem',
              letterSpacing: '0.05em',
              padding: '0.6rem 1.5rem',
              background: 'none',
              border: 'none',
              borderBottom: mode === m ? '2px solid var(--color-gold)' : '2px solid transparent',
              color: mode === m ? 'var(--color-gold-dark)' : 'var(--color-stone)',
              cursor: 'pointer',
              marginBottom: '-1px',
              transition: 'all 0.15s',
            }}
          >
            {m === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label style={{
            fontFamily: 'var(--font-garamond)',
            fontSize: '0.8rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-stone)',
            display: 'block',
            marginBottom: '0.4rem',
          }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = 'rgba(201,168,76,0.7)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(201,168,76,0.3)')}
          />
        </div>

        <div>
          <label style={{
            fontFamily: 'var(--font-garamond)',
            fontSize: '0.8rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-stone)',
            display: 'block',
            marginBottom: '0.4rem',
          }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            minLength={6}
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = 'rgba(201,168,76,0.7)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(201,168,76,0.3)')}
          />
        </div>

        {error && (
          <p style={{ fontFamily: 'var(--font-garamond)', color: '#c0392b', fontSize: '0.9rem' }}>
            {error}
          </p>
        )}
        {message && (
          <p style={{ fontFamily: 'var(--font-garamond)', color: 'var(--color-gold-dark)', fontSize: '0.9rem' }}>
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '1rem',
            fontStyle: 'italic',
            letterSpacing: '0.04em',
            color: loading ? 'var(--color-stone-light)' : 'var(--color-gold-dark)',
            backgroundColor: loading ? 'rgba(201,168,76,0.05)' : 'rgba(201,168,76,0.1)',
            border: '1px solid rgba(201,168,76,0.4)',
            borderRadius: '2px',
            padding: '0.75rem 2rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '0.5rem',
            transition: 'all 0.15s',
            width: '100%',
          }}
        >
          {loading ? 'Please wait…' : mode === 'signin' ? 'Enter the Agora' : 'Join the Agora'}
        </button>
      </form>
    </div>
  )
}
