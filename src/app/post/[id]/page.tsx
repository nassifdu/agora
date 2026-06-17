export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { deletePost } from '@/app/actions/deletePost'
import type { Comment, Tag } from '@/lib/types'
import TagBadge from '@/components/TagBadge'
import LikeButton from '@/components/LikeButton'
import CommentSection from '@/components/CommentSection'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: post } = await supabase.from('posts').select('main_thought').eq('id', id).single()
  return {
    title: post ? `${post.main_thought.slice(0, 60)} — ἀγορά` : 'ἀγορά',
  }
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: post } = await supabase
    .from('posts')
    .select(`
      *,
      profiles(id, username, avatar_url, created_at),
      post_tags(tags(id, name)),
      likes(count),
      comments(count)
    `)
    .eq('id', id)
    .single()

  if (!post) notFound()

  const { data: commentsRaw } = await supabase
    .from('comments')
    .select('*, profiles(id, username, avatar_url, created_at)')
    .eq('post_id', id)
    .order('created_at', { ascending: true })

  const tags = (post.post_tags ?? []).map((pt: { tags: Tag | null }) => pt.tags).filter(Boolean) as Tag[]
  const likesCount = post.likes?.[0]?.count ?? 0
  const commentsCount = post.comments?.[0]?.count ?? 0

  let userHasLiked = false
  if (user) {
    const { data: like } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', id)
      .eq('user_id', user.id)
      .single()
    userHasLiked = !!like
  }

  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const isOwner = user?.id === post.user_id

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 sm:py-16">
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        {/* Back */}
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-garamond)',
            fontSize: '0.85rem',
            letterSpacing: '0.05em',
            color: 'var(--color-stone)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            marginBottom: '2.5rem',
            transition: 'color 0.15s',
          }}
          className="hover:text-obsidian"
        >
          <span aria-hidden>←</span> Back to gallery
        </Link>

        {/* Post */}
        <article
          className="card-marble"
          style={{
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: '4px',
            overflow: 'hidden',
            boxShadow: '0 6px 32px rgba(26,23,20,0.07)',
            marginBottom: '2.5rem',
          }}
        >
          {/* Image */}
          {post.is_image && post.image_url && (
            <div style={{ position: 'relative', width: '100%', maxHeight: '520px', overflow: 'hidden' }}>
              <Image
                src={post.image_url}
                alt={post.main_thought}
                width={1200}
                height={600}
                style={{ width: '100%', height: 'auto', maxHeight: '520px', objectFit: 'cover', display: 'block' }}
                unoptimized
              />
              <div style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                height: '50%',
                background: 'linear-gradient(to top, rgba(26,23,20,0.5), transparent)',
              }} />
            </div>
          )}

          <div style={{ padding: '2.5rem' }}>
            {/* Meta */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.75rem',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontFamily: 'var(--font-garamond)',
                fontSize: '0.85rem',
                color: 'var(--color-stone-light)',
              }}>
                {post.profiles?.username && (
                  <>
                    <span style={{ color: 'var(--color-stone)' }}>{post.profiles.username}</span>
                    <span style={{ color: 'rgba(201,168,76,0.5)' }}>·</span>
                  </>
                )}
                <time dateTime={post.created_at}>{formattedDate}</time>
              </div>
              {isOwner && (
                <DeleteButton postId={id} />
              )}
            </div>

            {/* Main thought */}
            <blockquote style={{
              fontFamily: 'var(--font-playfair)',
              fontStyle: 'italic',
              fontWeight: 700,
              fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
              color: 'var(--color-obsidian)',
              lineHeight: 1.35,
              margin: '0 0 1.5rem 0',
              letterSpacing: '-0.01em',
              borderLeft: '3px solid rgba(201,168,76,0.5)',
              paddingLeft: '1.5rem',
            }}>
              {post.main_thought}
            </blockquote>

            {/* Details */}
            {post.details && (
              <>
                <div style={{ height: '1px', backgroundColor: 'rgba(201,168,76,0.15)', marginBottom: '1.25rem' }} />
                <p style={{
                  fontFamily: 'var(--font-garamond)',
                  fontSize: '1.05rem',
                  color: 'var(--color-stone)',
                  lineHeight: 1.7,
                  marginBottom: '1.5rem',
                }}>
                  {post.details}
                </p>
              </>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {tags.map(tag => (
                  <TagBadge key={tag.id} name={tag.name} size="md" />
                ))}
              </div>
            )}

            {/* Actions */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid rgba(201,168,76,0.15)',
            }}>
              <LikeButton
                postId={id}
                initialCount={likesCount}
                initialLiked={userHasLiked}
              />
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: 'var(--color-stone-light)',
                fontFamily: 'var(--font-garamond)',
                fontSize: '0.9rem',
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                {commentsCount}
              </span>
            </div>
          </div>
        </article>

        {/* Comments */}
        <CommentSection
          postId={id}
          initialComments={(commentsRaw ?? []) as Comment[]}
        />
      </div>
    </div>
  )
}

function DeleteButton({ postId }: { postId: string }) {
  return (
    <form action={deletePost.bind(null, postId)}>
      <button
        type="submit"
        style={{
          fontFamily: 'var(--font-garamond)',
          fontSize: '0.8rem',
          color: 'var(--color-stone-light)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          letterSpacing: '0.04em',
          padding: '0.25rem 0.5rem',
        }}
        className="hover:text-stone"
      >
        remove
      </button>
    </form>
  )
}
