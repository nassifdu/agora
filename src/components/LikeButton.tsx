'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface LikeButtonProps {
  postId: string
  initialCount: number
  initialLiked: boolean
}

export default function LikeButton({ postId, initialCount, initialLiked }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function toggle() {
    if (loading) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/auth'
      return
    }

    if (liked) {
      await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', user.id)
      setCount(c => c - 1)
      setLiked(false)
    } else {
      await supabase.from('likes').insert({ post_id: postId, user_id: user.id })
      setCount(c => c + 1)
      setLiked(true)
    }

    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.35rem',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'var(--font-garamond)',
        fontSize: '0.9rem',
        color: liked ? 'var(--color-gold-dark)' : 'var(--color-stone-light)',
        transition: 'color 0.15s, transform 0.1s',
        padding: '0.25rem 0.5rem',
        borderRadius: '2px',
      }}
      className="hover:text-gold-dark"
      aria-label={liked ? 'Unlike' : 'Like'}
    >
      <HeartIcon filled={liked} />
      <span>{count}</span>
    </button>
  )
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}
