'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '3rem',
    }}>
      <p style={{
        fontFamily: 'var(--font-playfair)',
        fontStyle: 'italic',
        fontSize: '1.5rem',
        color: 'var(--color-stone)',
        marginBottom: '1.5rem',
      }}>
        Something disturbed the agora.
      </p>
      {error.message && (
        <pre style={{
          fontFamily: 'monospace',
          fontSize: '0.8rem',
          color: 'var(--color-stone-light)',
          background: 'rgba(201,168,76,0.05)',
          border: '1px solid rgba(201,168,76,0.15)',
          borderRadius: '3px',
          padding: '1rem',
          marginBottom: '1.5rem',
          maxWidth: '600px',
          whiteSpace: 'pre-wrap',
          textAlign: 'left',
        }}>
          {error.message}
        </pre>
      )}
      <button
        onClick={reset}
        style={{
          fontFamily: 'var(--font-garamond)',
          color: 'var(--color-gold-dark)',
          border: '1px solid rgba(201,168,76,0.4)',
          background: 'rgba(201,168,76,0.08)',
          borderRadius: '2px',
          padding: '0.5rem 1.5rem',
          cursor: 'pointer',
        }}
      >
        Try again
      </button>
    </div>
  )
}
