'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NewPostForm({ userId }: { userId: string }) {
  const router = useRouter()
  const supabase = createClient()

  const [mainThought, setMainThought] = useState('')
  const [details, setDetails] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isImage, setIsImage] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!mainThought.trim()) return
    setSubmitting(true)
    setError('')

    // Insert post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        main_thought: mainThought.trim(),
        details: details.trim() || null,
        image_url: isImage && imageUrl.trim() ? imageUrl.trim() : null,
        is_image: isImage && !!imageUrl.trim(),
      })
      .select()
      .single()

    if (postError || !post) {
      setError(postError?.message ?? 'Something went wrong')
      setSubmitting(false)
      return
    }

    // Handle tags
    const tagNames = tagsInput
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(Boolean)

    if (tagNames.length > 0) {
      // Upsert tags
      const { data: tags } = await supabase
        .from('tags')
        .upsert(tagNames.map(name => ({ name })), { onConflict: 'name' })
        .select()

      if (tags && tags.length > 0) {
        await supabase.from('post_tags').insert(
          tags.map((tag: { id: string }) => ({ post_id: post.id, tag_id: tag.id }))
        )
      }
    }

    router.push(`/post/${post.id}`)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.85rem 1.1rem',
    fontFamily: 'var(--font-garamond)',
    fontSize: '1rem',
    color: 'var(--color-obsidian)',
    backgroundColor: 'rgba(250,247,242,0.8)',
    border: '1px solid rgba(201,168,76,0.3)',
    borderRadius: '3px',
    outline: 'none',
    transition: 'border-color 0.15s',
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-garamond)',
    fontSize: '0.85rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--color-stone)',
    display: 'block',
    marginBottom: '0.5rem',
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Type toggle */}
      <div>
        <label style={labelStyle}>Type</label>
        <div style={{ display: 'flex', gap: '0' }}>
          {[
            { value: false, label: 'Text thought' },
            { value: true, label: 'Image post' },
          ].map(opt => (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => setIsImage(opt.value)}
              style={{
                fontFamily: 'var(--font-garamond)',
                fontSize: '0.9rem',
                padding: '0.5rem 1.25rem',
                border: '1px solid rgba(201,168,76,0.35)',
                backgroundColor: isImage === opt.value ? 'rgba(201,168,76,0.15)' : 'transparent',
                color: isImage === opt.value ? 'var(--color-gold-dark)' : 'var(--color-stone)',
                cursor: 'pointer',
                transition: 'all 0.15s',
                borderRadius: opt.value ? '0 2px 2px 0' : '2px 0 0 2px',
                marginLeft: opt.value ? '-1px' : 0,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main thought */}
      <div>
        <label style={labelStyle}>
          {isImage ? 'Caption / Main thought' : 'Main thought'}
          <span style={{ color: 'var(--color-gold)', marginLeft: '0.3rem' }}>*</span>
        </label>
        <textarea
          value={mainThought}
          onChange={e => setMainThought(e.target.value)}
          placeholder={isImage ? 'The caption for your image…' : 'A thought, phrase, or reflection…'}
          rows={isImage ? 2 : 4}
          required
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.55 }}
          onFocus={e => (e.target.style.borderColor = 'rgba(201,168,76,0.7)')}
          onBlur={e => (e.target.style.borderColor = 'rgba(201,168,76,0.3)')}
        />
      </div>

      {/* Image URL */}
      {isImage && (
        <div>
          <label style={labelStyle}>Image URL</label>
          <input
            type="url"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            placeholder="https://…"
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = 'rgba(201,168,76,0.7)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(201,168,76,0.3)')}
          />
        </div>
      )}

      {/* Details */}
      <div>
        <label style={labelStyle}>Details <span style={{ color: 'var(--color-stone-light)', fontStyle: 'italic', textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
        <textarea
          value={details}
          onChange={e => setDetails(e.target.value)}
          placeholder="Context, elaboration, source…"
          rows={3}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.55 }}
          onFocus={e => (e.target.style.borderColor = 'rgba(201,168,76,0.7)')}
          onBlur={e => (e.target.style.borderColor = 'rgba(201,168,76,0.3)')}
        />
      </div>

      {/* Tags */}
      <div>
        <label style={labelStyle}>Tags <span style={{ color: 'var(--color-stone-light)', fontStyle: 'italic', textTransform: 'none', letterSpacing: 0 }}>(comma separated)</span></label>
        <input
          type="text"
          value={tagsInput}
          onChange={e => setTagsInput(e.target.value)}
          placeholder="philosophy, stoicism, beauty…"
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

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            fontFamily: 'var(--font-garamond)',
            fontSize: '0.95rem',
            letterSpacing: '0.04em',
            color: 'var(--color-stone)',
            background: 'none',
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: '2px',
            padding: '0.6rem 1.4rem',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || !mainThought.trim()}
          style={{
            fontFamily: 'var(--font-garamond)',
            fontSize: '1rem',
            letterSpacing: '0.06em',
            color: submitting || !mainThought.trim() ? 'var(--color-stone-light)' : 'var(--color-gold-dark)',
            backgroundColor: submitting || !mainThought.trim() ? 'rgba(201,168,76,0.05)' : 'rgba(201,168,76,0.12)',
            border: '1px solid rgba(201,168,76,0.4)',
            borderRadius: '2px',
            padding: '0.6rem 2rem',
            cursor: submitting || !mainThought.trim() ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {submitting ? 'Publishing…' : 'Publish'}
        </button>
      </div>
    </form>
  )
}
