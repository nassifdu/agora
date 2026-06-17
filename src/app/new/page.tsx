export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NewPostForm from '@/components/NewPostForm'

export const metadata = {
  title: 'New Thought — ἀγορά',
}

export default async function NewPostPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 sm:py-16">
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <p style={{
            fontFamily: 'var(--font-garamond)',
            fontSize: '0.8rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--color-stone)',
            marginBottom: '0.5rem',
          }}>
            New entry
          </p>
          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontStyle: 'italic',
            fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
            fontWeight: 700,
            color: 'var(--color-obsidian)',
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
          }}>
            Share a thought
          </h1>
          <hr className="gold-rule" style={{ marginTop: '1rem', maxWidth: '60px' }} />
        </div>

        <div
          className="card-marble"
          style={{
            padding: '2.5rem',
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: '4px',
            boxShadow: '0 4px 24px rgba(26,23,20,0.05)',
          }}
        >
          <NewPostForm userId={user.id} />
        </div>

        <p style={{
          fontFamily: 'var(--font-garamond)',
          fontStyle: 'italic',
          fontSize: '0.85rem',
          color: 'var(--color-stone-light)',
          textAlign: 'center',
          marginTop: '1.5rem',
        }}>
          What you offer to the agora becomes part of the collective mind.
        </p>
      </div>
    </div>
  )
}
