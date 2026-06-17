@AGENTS.md

# ἀγορά — Project Guide

A Greek-themed gallery of thoughts and ideas, built with Next.js 16 (App Router), Supabase, and Tailwind CSS v4. Deployed on Vercel.

## Stack

- **Framework**: Next.js 16 App Router (React 19, TypeScript)
- **Database & Auth**: Supabase (PostgreSQL + Row Level Security)
- **Styling**: Tailwind CSS v4 (configured in `globals.css` via `@theme`, no `tailwind.config.ts`)
- **Fonts**: Playfair Display (headings/logo) + EB Garamond (body) via `next/font/google`
- **Deployment**: Vercel

## Development

```bash
cp .env.example .env.local   # fill in your Supabase keys
npm install
npm run dev                  # http://localhost:3000
npm run build                # production build
npm run lint
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Add these to Vercel project settings for deployment.

## Supabase Setup

1. Create a Supabase project at supabase.com
2. Go to Project → SQL Editor → New query
3. Paste and run `supabase-schema.sql` (included in repo root)
4. Go to Project Settings → API to get your URL and anon key
5. Enable email auth: Authentication → Providers → Email

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout: fonts, Header, footer
│   ├── globals.css         # Tailwind @theme + design tokens + marble CSS
│   ├── page.tsx            # Gallery home (server, masonry grid)
│   ├── auth/page.tsx       # Login / sign up
│   ├── new/page.tsx        # Create post (requires auth)
│   ├── post/[id]/page.tsx  # Post detail + comments
│   └── tag/[tag]/page.tsx  # Posts filtered by tag
├── components/
│   ├── Header.tsx          # Sticky header with logo (client — auth state)
│   ├── PostCard.tsx        # Card: main thought (italic bold) + details
│   ├── TagBadge.tsx        # Gold tag chip (links to /tag/[name])
│   ├── LikeButton.tsx      # Heart toggle (client)
│   ├── CommentSection.tsx  # Comment list + form (client)
│   ├── NewPostForm.tsx     # Create post form (client)
│   └── AuthForm.tsx        # Sign in / sign up form (client)
└── lib/
    ├── types.ts             # Post, Profile, Tag, Comment types
    └── supabase/
        ├── client.ts        # Browser Supabase client
        └── server.ts        # Server Supabase client (uses cookies())
```

## Post Structure

Each post has:
- **main_thought**: large italic bold serif text (or image caption) — the primary idea
- **image_url** + **is_image**: when set, the image is displayed prominently
- **details**: smaller, dimmer supporting text below the main thought
- **tags**: many-to-many via `post_tags`
- **likes** and **comments** tables

## Design System

Colors (defined as CSS variables in `globals.css` `@theme`):
- `--color-gold` `#C9A84C` — primary accent
- `--color-gold-dark` `#8A6914` — text on light backgrounds
- `--color-parchment` `#FAF7F2` — page background
- `--color-marble` `#F5F0E8` — card background
- `--color-obsidian` `#1A1714` — primary text
- `--color-stone` `#6B6560` — secondary text
- `--color-stone-light` `#9E9590` — muted text

Use Tailwind class `text-gold`, `bg-marble`, `border-gold` etc. (mapped from `@theme`).

## Key Conventions

- Pages are **Server Components** by default; interactive pieces use `'use client'`
- Supabase server client: import from `@/lib/supabase/server` (async, uses `cookies()`)
- Supabase browser client: import from `@/lib/supabase/client` (sync, browser only)
- `params` in App Router pages is a `Promise<{...}>` — always `await params`
- `searchParams` is also a `Promise` — always `await searchParams`
- Tailwind v4: no `tailwind.config.ts`; add custom tokens in `globals.css` `@theme {}`

## Vercel Deployment

1. Push repo to GitHub
2. Import project in Vercel
3. Add env vars: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy — it uses `npm run build` automatically
