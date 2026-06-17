'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Comment } from '@/lib/types'

interface CommentSectionProps {
  postId: string
  initialComments: Comment[]
}

export default function CommentSection({ postId, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
  }, [supabase])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || !userId) return
    setSubmitting(true)

    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: postId, user_id: userId, content: text.trim() })
      .select('*, profiles(id, username, avatar_url, created_at)')
      .single()

    if (!error && data) {
      setComments(prev => [...prev, data as Comment])
      setText('')
    }
    setSubmitting(false)
  }

  async function deleteComment(commentId: string) {
    await supabase.from('comments').delete().eq('id', commentId).eq('user_id', userId!)
    setComments(prev => prev.filter(c => c.id !== commentId))
  }

  return (
    <section id="comments" style={{ marginTop: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <h2 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '1.3rem',
          fontWeight: 600,
          color: 'var(--color-obsidian)',
          letterSpacing: '-0.01em',
        }}>
          Dialogue
        </h2>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(201,168,76,0.2)' }} />
        <span style={{
          fontFamily: 'var(--font-garamond)',
          fontSize: '0.85rem',
          color: 'var(--color-stone-light)',
        }}>
          {comments.length} {comments.length === 1 ? 'reply' : 'replies'}
        </span>
      </div>

      {/* Comment list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
        {comments.length === 0 && (
          <p style={{
            fontFamily: 'var(--font-garamond)',
            fontStyle: 'italic',
            color: 'var(--color-stone-light)',
            fontSize: '1rem',
            padding: '1.5rem 0',
          }}>
            Be the first to respond…
          </p>
        )}
        {comments.map(comment => (
          <div
            key={comment.id}
            style={{
              padding: '1.1rem 1.4rem',
              background: 'linear-gradient(145deg, #FDFBF8, #F5F0E8)',
              border: '1px solid rgba(201,168,76,0.15)',
              borderRadius: '3px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{
                  fontFamily: 'var(--font-garamond)',
                  fontWeight: 600,
                  color: 'var(--color-obsidian)',
                  fontSize: '0.9rem',
                }}>
                  {comment.profiles?.username ?? 'Anon'}
                </span>
                <span style={{ color: 'rgba(201,168,76,0.5)', fontSize: '0.75rem' }}>·</span>
                <time style={{
                  fontFamily: 'var(--font-garamond)',
                  fontSize: '0.8rem',
                  color: 'var(--color-stone-light)',
                }}>
                  {new Date(comment.created_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </time>
              </div>
              {comment.user_id === userId && (
                <button
                  onClick={() => deleteComment(comment.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-stone-light)',
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-garamond)',
                    padding: 0,
                  }}
                  className="hover:text-stone"
                >
                  remove
                </button>
              )}
            </div>
            <p style={{
              fontFamily: 'var(--font-garamond)',
              fontSize: '1rem',
              color: 'var(--color-stone)',
              lineHeight: 1.6,
              margin: 0,
            }}>
              {comment.content}
            </p>
          </div>
        ))}
      </div>

      {/* Comment form */}
      {userId ? (
        <form onSubmit={submit}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Add your voice…"
            rows={3}
            style={{
              width: '100%',
              padding: '0.9rem 1.1rem',
              fontFamily: 'var(--font-garamond)',
              fontSize: '1rem',
              color: 'var(--color-obsidian)',
              backgroundColor: 'rgba(250,247,242,0.8)',
              border: '1px solid rgba(201,168,76,0.3)',
              borderRadius: '3px',
              resize: 'vertical',
              outline: 'none',
              lineHeight: 1.55,
              transition: 'border-color 0.15s',
            }}
            onFocus={e => (e.target.style.borderColor = 'rgba(201,168,76,0.7)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(201,168,76,0.3)')}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
            <button
              type="submit"
              disabled={submitting || !text.trim()}
              style={{
                fontFamily: 'var(--font-garamond)',
                fontSize: '0.95rem',
                letterSpacing: '0.06em',
                color: 'var(--color-gold-dark)',
                backgroundColor: 'rgba(201,168,76,0.1)',
                border: '1px solid rgba(201,168,76,0.45)',
                borderRadius: '2px',
                padding: '0.5rem 1.5rem',
                cursor: submitting || !text.trim() ? 'not-allowed' : 'pointer',
                opacity: submitting || !text.trim() ? 0.5 : 1,
                transition: 'all 0.15s',
              }}
            >
              {submitting ? 'Sending…' : 'Reply'}
            </button>
          </div>
        </form>
      ) : (
        <p style={{
          fontFamily: 'var(--font-garamond)',
          fontSize: '0.95rem',
          color: 'var(--color-stone)',
          padding: '1rem 1.4rem',
          border: '1px solid rgba(201,168,76,0.15)',
          borderRadius: '3px',
          backgroundColor: 'rgba(201,168,76,0.04)',
        }}>
          <a href="/auth" style={{ color: 'var(--color-gold-dark)', textDecoration: 'underline', textDecorationColor: 'rgba(201,168,76,0.4)' }}>
            Enter the agora
          </a>{' '}
          to join the dialogue.
        </p>
      )}
    </section>
  )
}
