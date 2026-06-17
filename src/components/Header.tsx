'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <header style={{
      borderBottom: '1px solid rgba(201,168,76,0.25)',
      backgroundColor: 'rgba(250,247,242,0.95)',
      backdropFilter: 'blur(8px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group flex flex-col leading-none">
          <span
            className="text-gold-gradient"
            style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
              fontWeight: 700,
              fontStyle: 'italic',
              letterSpacing: '-0.01em',
              lineHeight: 1,
            }}
          >
            ἀγορά
          </span>
          <span
            style={{
              fontFamily: 'var(--font-garamond)',
              fontSize: '0.7rem',
              letterSpacing: '0.25em',
              color: 'var(--color-stone)',
              textTransform: 'uppercase',
              marginTop: '2px',
            }}
          >
            gallery of thoughts
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-6">
          <NavLink href="/">Gallery</NavLink>
          {user && <NavLink href="/new">New Post</NavLink>}
          {user ? (
            <div className="flex items-center gap-4">
              <span style={{ fontFamily: 'var(--font-garamond)', color: 'var(--color-stone)', fontSize: '0.95rem' }}>
                {user.email?.split('@')[0]}
              </span>
              <button
                onClick={handleSignOut}
                style={{
                  fontFamily: 'var(--font-garamond)',
                  color: 'var(--color-stone)',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  letterSpacing: '0.02em',
                }}
                className="hover:text-gold transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              style={{
                fontFamily: 'var(--font-garamond)',
                fontSize: '0.95rem',
                border: '1px solid rgba(201,168,76,0.5)',
                color: 'var(--color-gold-dark)',
                padding: '0.35rem 1.1rem',
                borderRadius: '2px',
                letterSpacing: '0.04em',
                transition: 'all 0.2s',
              }}
              className="hover:bg-gold-muted"
            >
              Enter
            </Link>
          )}
        </nav>

        {/* Mobile menu toggle */}
        <button
          className="sm:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {[0,1,2].map(i => (
              <span key={i} style={{ width: '22px', height: '1px', backgroundColor: 'var(--color-gold)', display: 'block' }} />
            ))}
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          style={{
            borderTop: '1px solid rgba(201,168,76,0.2)',
            backgroundColor: 'rgba(250,247,242,0.98)',
            padding: '1rem 1.5rem',
          }}
          className="sm:hidden"
        >
          <div className="flex flex-col gap-4">
            <NavLink href="/" onClick={() => setMenuOpen(false)}>Gallery</NavLink>
            {user && <NavLink href="/new" onClick={() => setMenuOpen(false)}>New Post</NavLink>}
            {user ? (
              <button onClick={handleSignOut} style={{ fontFamily: 'var(--font-garamond)', textAlign: 'left', background: 'none', border: 'none', color: 'var(--color-stone)', cursor: 'pointer' }}>
                Sign out
              </button>
            ) : (
              <NavLink href="/auth" onClick={() => setMenuOpen(false)}>Enter</NavLink>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

function NavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        fontFamily: 'var(--font-garamond)',
        color: 'var(--color-stone)',
        fontSize: '1rem',
        letterSpacing: '0.04em',
        transition: 'color 0.15s',
      }}
      className="hover:text-obsidian"
    >
      {children}
    </Link>
  )
}
