export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Post, Tag } from '@/lib/types'
import PostCard from '@/components/PostCard'
import TagBadge from '@/components/TagBadge'

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params
  return { title: `#${decodeURIComponent(tag)} — ἀγορά` }
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag: tagSlug } = await params
  const tagName = decodeURIComponent(tagSlug)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Find the tag
  const { data: tagData } = await supabase
    .from('tags')
    .select('id, name')
    .eq('name', tagName)
    .single()

  let posts: Post[] = []

  if (tagData) {
    const { data: postTagRows } = await supabase
      .from('post_tags')
      .select('post_id')
      .eq('tag_id', tagData.id)

    const postIds = (postTagRows ?? []).map((r: { post_id: string }) => r.post_id)

    if (postIds.length > 0) {
      const { data: rawPosts } = await supabase
        .from('posts')
        .select(`
          *,
          profiles(id, username, avatar_url, created_at),
          post_tags(tags(id, name)),
          likes(count),
          comments(count)
        `)
        .in('id', postIds)
        .order('created_at', { ascending: false })

      const likedMap: Record<string, boolean> = {}
      if (user && rawPosts) {
        const { data: userLikes } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds)
        if (userLikes) {
          userLikes.forEach((l: { post_id: string }) => { likedMap[l.post_id] = true })
        }
      }

      posts = (rawPosts ?? []).map((p: Record<string, unknown> & {
        post_tags?: Array<{ tags: Tag | null }>
        likes?: Array<{ count: number }>
        comments?: Array<{ count: number }>
      }) => ({
        ...p,
        tags: (p.post_tags ?? []).map(pt => pt.tags).filter(Boolean) as Tag[],
        likes_count: p.likes?.[0]?.count ?? 0,
        comments_count: p.comments?.[0]?.count ?? 0,
        user_has_liked: likedMap[p.id as string] ?? false,
      })) as Post[]
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div style={{ marginBottom: '3rem' }}>
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-garamond)',
            fontSize: '0.85rem',
            color: 'var(--color-stone)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            marginBottom: '1.5rem',
          }}
        >
          <span aria-hidden>←</span> All thoughts
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontStyle: 'italic',
            fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
            fontWeight: 700,
            color: 'var(--color-obsidian)',
            lineHeight: 1.2,
          }}>
            On{' '}
          </h1>
          <TagBadge name={tagName} size="md" clickable={false} />
        </div>
        <p style={{
          fontFamily: 'var(--font-garamond)',
          fontSize: '0.9rem',
          color: 'var(--color-stone-light)',
          marginTop: '0.5rem',
        }}>
          {posts.length} {posts.length === 1 ? 'thought' : 'thoughts'}
        </p>
      </div>

      {posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
          <p style={{
            fontFamily: 'var(--font-playfair)',
            fontStyle: 'italic',
            fontSize: '1.3rem',
            color: 'var(--color-stone)',
          }}>
            No thoughts on this topic yet.
          </p>
          {user && (
            <Link
              href="/new"
              style={{
                display: 'inline-block',
                marginTop: '1.25rem',
                fontFamily: 'var(--font-garamond)',
                color: 'var(--color-gold-dark)',
                textDecoration: 'underline',
                textDecorationColor: 'rgba(201,168,76,0.4)',
              }}
            >
              Be the first to share one
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
