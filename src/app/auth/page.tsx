export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AuthForm from '@/components/AuthForm'

export const metadata = {
  title: 'Enter the Agora',
}

export default async function AuthPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/')

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 sm:py-24">
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        {/* Decorative header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-playfair)',
                fontStyle: 'italic',
                fontSize: '3rem',
                fontWeight: 700,
                display: 'block',
                lineHeight: 1,
              }}
              className="text-gold-gradient"
            >
              ἀγορά
            </span>
          </div>
          <hr className="gold-rule" style={{ maxWidth: '80px', margin: '0 auto 1.25rem' }} />
          <p style={{
            fontFamily: 'var(--font-garamond)',
            fontStyle: 'italic',
            fontSize: '1.05rem',
            color: 'var(--color-stone)',
            lineHeight: 1.6,
          }}>
            Enter the agora to share thoughts,<br />collect ideas, and join the dialogue.
          </p>
        </div>

        {/* Card */}
        <div
          className="card-marble"
          style={{
            padding: '2.5rem',
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: '4px',
            boxShadow: '0 4px 24px rgba(26,23,20,0.06)',
          }}
        >
          <AuthForm />
        </div>
      </div>
    </div>
  )
}
