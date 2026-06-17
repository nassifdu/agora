import Link from 'next/link'
import Image from 'next/image'
import type { Post } from '@/lib/types'
import TagBadge from './TagBadge'
import LikeButton from './LikeButton'

interface PostCardProps {
  post: Post
  featured?: boolean
}

export default function PostCard({ post, featured = false }: PostCardProps) {
  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <article
      className="card-marble post-card"
      style={{
        border: '1px solid rgba(201,168,76,0.2)',
        borderRadius: '4px',
        overflow: 'hidden',
      }}
    >
      {/* Image */}
      {post.is_image && post.image_url && (
        <Link href={`/post/${post.id}`}>
          <div style={{ position: 'relative', width: '100%', minHeight: '200px', overflow: 'hidden' }}>
            <Image
              src={post.image_url}
              alt={post.main_thought}
              width={600}
              height={400}
              style={{ width: '100%', height: 'auto', objectFit: 'cover', display: 'block' }}
              unoptimized
            />
            {/* Gold gradient overlay at bottom */}
            <div style={{
              position: 'absolute',
              bottom: 0, left: 0, right: 0,
              height: '40%',
              background: 'linear-gradient(to top, rgba(26,23,20,0.55), transparent)',
            }} />
          </div>
        </Link>
      )}

      <div style={{ padding: featured ? '2rem' : '1.5rem 1.4rem 1.2rem' }}>
        {/* Author & date */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1rem',
          color: 'var(--color-stone-light)',
          fontFamily: 'var(--font-garamond)',
          fontSize: '0.8rem',
          letterSpacing: '0.04em',
        }}>
          {post.profiles?.username && (
            <>
              <span>{post.profiles.username}</span>
              <span style={{ color: 'rgba(201,168,76,0.5)' }}>·</span>
            </>
          )}
          <time dateTime={post.created_at}>{formattedDate}</time>
        </div>

        {/* Main thought */}
        <Link href={`/post/${post.id}`}>
          <div
            style={{
              fontFamily: 'var(--font-playfair)',
              fontStyle: 'italic',
              fontWeight: 700,
              fontSize: featured ? 'clamp(1.5rem, 2.5vw, 2rem)' : 'clamp(1.1rem, 2vw, 1.4rem)',
              color: 'var(--color-obsidian)',
              lineHeight: 1.35,
              marginBottom: post.details ? '1rem' : '0',
              letterSpacing: '-0.01em',
            }}
          >
            {post.is_image && post.image_url
              ? <span style={{ color: 'var(--color-obsidian)' }}>{post.main_thought}</span>
              : post.main_thought
            }
          </div>
        </Link>

        {/* Details */}
        {post.details && (
          <p
            style={{
              fontFamily: 'var(--font-garamond)',
              fontSize: '0.95rem',
              color: 'var(--color-stone)',
              lineHeight: 1.65,
              marginBottom: '1.1rem',
            }}
          >
            {post.details}
          </p>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.1rem' }}>
            {post.tags.map(tag => (
              <TagBadge key={tag.id} name={tag.name} />
            ))}
          </div>
        )}

        {/* Footer: likes + comments */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid rgba(201,168,76,0.12)',
          }}
        >
          <LikeButton
            postId={post.id}
            initialCount={post.likes_count ?? 0}
            initialLiked={post.user_has_liked ?? false}
          />
          <Link
            href={`/post/${post.id}#comments`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: 'var(--color-stone-light)',
              fontFamily: 'var(--font-garamond)',
              fontSize: '0.9rem',
              transition: 'color 0.15s',
            }}
            className="hover:text-stone"
          >
            <CommentIcon />
            <span>{post.comments_count ?? 0}</span>
          </Link>
        </div>
      </div>
    </article>
  )
}

function CommentIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}
