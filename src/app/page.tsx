export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Post, Tag } from '@/lib/types'
import PostCard from '@/components/PostCard'
import TagBadge from '@/components/TagBadge'

async function getPosts(supabase: Awaited<ReturnType<typeof createClient>>, userId: string | null) {
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      profiles(id, username, avatar_url, created_at),
      post_tags(tags(id, name)),
      likes(count),
      comments(count)
    `)
    .order('created_at', { ascending: false })
    .limit(60)

  if (!posts) return []

  const likesMap: Record<string, boolean> = {}
  if (userId && posts.length > 0) {
    const { data: userLikes } = await supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', userId)
      .in('post_id', posts.map((p: Record<string, unknown>) => p.id))
    if (userLikes) {
      userLikes.forEach((l: { post_id: string }) => { likesMap[l.post_id] = true })
    }
  }

  return posts.map((p: Record<string, unknown> & {
    post_tags?: Array<{ tags: Tag | null }>
    likes?: Array<{ count: number }>
    comments?: Array<{ count: number }>
  }) => ({
    ...p,
    tags: (p.post_tags ?? []).map((pt) => pt.tags).filter(Boolean) as Tag[],
    likes_count: (p.likes as Array<{ count: number }>)?.[0]?.count ?? 0,
    comments_count: (p.comments as Array<{ count: number }>)?.[0]?.count ?? 0,
    user_has_liked: likesMap[p.id as string] ?? false,
  })) as Post[]
}

async function getAllTags(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data } = await supabase.from('tags').select('*').order('name').limit(50)
  return (data ?? []) as Tag[]
}

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>
}) {
  const { tag } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [allPosts, allTags] = await Promise.all([
    getPosts(supabase, user?.id ?? null),
    getAllTags(supabase),
  ])

  const posts = tag
    ? allPosts.filter(p => p.tags?.some(t => t.name === tag))
    : allPosts

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'inline-block', marginBottom: '1.5rem' }}>
          <div style={{
            width: '40px',
            height: '1px',
            backgroundColor: 'rgba(201,168,76,0.5)',
            display: 'inline-block',
            verticalAlign: 'middle',
            marginRight: '1rem',
          }} />
          <span style={{
            fontFamily: 'var(--font-garamond)',
            fontSize: '0.8rem',
            letterSpacing: '0.25em',
            color: 'var(--color-stone)',
            textTransform: 'uppercase',
          }}>
            A gallery of thoughts
          </span>
          <div style={{
            width: '40px',
            height: '1px',
            backgroundColor: 'rgba(201,168,76,0.5)',
            display: 'inline-block',
            verticalAlign: 'middle',
            marginLeft: '1rem',
          }} />
        </div>

        {/* Active tag filter */}
        {tag && (
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
            <span style={{ fontFamily: 'var(--font-garamond)', color: 'var(--color-stone)', fontSize: '0.95rem' }}>
              Filtered by
            </span>
            <TagBadge name={tag} size="md" clickable={false} />
            <Link
              href="/"
              style={{
                fontFamily: 'var(--font-garamond)',
                fontSize: '0.85rem',
                color: 'var(--color-stone-light)',
                textDecoration: 'underline',
                textDecorationColor: 'rgba(201,168,76,0.4)',
              }}
            >
              clear
            </Link>
          </div>
        )}

        {/* New post CTA */}
        {user && (
          <div style={{ marginBottom: '1rem' }}>
            <Link
              href="/new"
              style={{
                fontFamily: 'var(--font-garamond)',
                fontSize: '0.95rem',
                letterSpacing: '0.05em',
                color: 'var(--color-gold-dark)',
                border: '1px solid rgba(201,168,76,0.4)',
                padding: '0.5rem 1.5rem',
                borderRadius: '2px',
                display: 'inline-block',
                transition: 'all 0.15s',
                backgroundColor: 'rgba(201,168,76,0.07)',
              }}
            >
              + Share a thought
            </Link>
          </div>
        )}
      </div>

      {/* Tags bar */}
      {allTags.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          justifyContent: 'center',
          marginBottom: '3rem',
          padding: '1rem 1.5rem',
          borderTop: '1px solid rgba(201,168,76,0.15)',
          borderBottom: '1px solid rgba(201,168,76,0.15)',
        }}>
          {allTags.map(t => (
            <TagBadge key={t.id} name={t.name} size="sm" />
          ))}
        </div>
      )}

      {/* Gallery */}
      {posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '6rem 0' }}>
          <p style={{
            fontFamily: 'var(--font-playfair)',
            fontStyle: 'italic',
            fontSize: '1.5rem',
            color: 'var(--color-stone)',
            marginBottom: '1rem',
          }}>
            The agora awaits its first voice.
          </p>
          {!user && (
            <Link
              href="/auth"
              style={{
                fontFamily: 'var(--font-garamond)',
                fontSize: '0.95rem',
                color: 'var(--color-gold-dark)',
                textDecoration: 'underline',
                textDecorationColor: 'rgba(201,168,76,0.4)',
              }}
            >
              Enter to begin
            </Link>
          )}
          {user && (
            <Link
              href="/new"
              style={{
                fontFamily: 'var(--font-garamond)',
                fontSize: '0.95rem',
                color: 'var(--color-gold-dark)',
                textDecoration: 'underline',
                textDecorationColor: 'rgba(201,168,76,0.4)',
              }}
            >
              Share the first thought
            </Link>
          )}
        </div>
      ) : (
        <div className="masonry">
          {posts.map(post => (
            <div key={post.id} className="masonry-item">
              <PostCard post={post} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
