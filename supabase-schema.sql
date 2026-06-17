-- ============================================================
-- ἀγορά — Supabase Schema
-- Run this in your Supabase SQL editor (Project → SQL Editor → New query)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. PROFILES
-- ────────────────────────────────────────────────────────────
create table public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  username    text unique not null,
  avatar_url  text,
  created_at  timestamptz default now() not null
);

-- Auto-create profile when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    split_part(new.email, '@', 1) || '_' || substring(new.id::text, 1, 4)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ────────────────────────────────────────────────────────────
-- 2. POSTS
-- ────────────────────────────────────────────────────────────
create table public.posts (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references public.profiles(id) on delete cascade not null,
  main_thought  text not null,
  image_url     text,
  details       text,
  is_image      boolean default false not null,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

create index posts_user_id_idx on public.posts(user_id);
create index posts_created_at_idx on public.posts(created_at desc);

-- ────────────────────────────────────────────────────────────
-- 3. TAGS
-- ────────────────────────────────────────────────────────────
create table public.tags (
  id          uuid default gen_random_uuid() primary key,
  name        text unique not null,
  created_at  timestamptz default now() not null
);

create table public.post_tags (
  post_id  uuid references public.posts(id) on delete cascade,
  tag_id   uuid references public.tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

create index post_tags_tag_id_idx on public.post_tags(tag_id);

-- ────────────────────────────────────────────────────────────
-- 4. LIKES
-- ────────────────────────────────────────────────────────────
create table public.likes (
  id          uuid default gen_random_uuid() primary key,
  post_id     uuid references public.posts(id) on delete cascade not null,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  created_at  timestamptz default now() not null,
  unique(post_id, user_id)
);

create index likes_post_id_idx on public.likes(post_id);

-- ────────────────────────────────────────────────────────────
-- 5. COMMENTS
-- ────────────────────────────────────────────────────────────
create table public.comments (
  id          uuid default gen_random_uuid() primary key,
  post_id     uuid references public.posts(id) on delete cascade not null,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  content     text not null,
  created_at  timestamptz default now() not null
);

create index comments_post_id_idx on public.comments(post_id);

-- ────────────────────────────────────────────────────────────
-- 6. ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────

-- Profiles
alter table public.profiles enable row level security;
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

-- Posts
alter table public.posts enable row level security;
create policy "Posts are viewable by everyone" on public.posts for select using (true);
create policy "Authenticated users can create posts" on public.posts for insert with check (auth.uid() = user_id);
create policy "Users can update their own posts" on public.posts for update using (auth.uid() = user_id);
create policy "Users can delete their own posts" on public.posts for delete using (auth.uid() = user_id);

-- Tags
alter table public.tags enable row level security;
create policy "Tags are viewable by everyone" on public.tags for select using (true);
create policy "Authenticated users can create tags" on public.tags for insert with check (auth.uid() is not null);

-- Post tags
alter table public.post_tags enable row level security;
create policy "Post tags are viewable by everyone" on public.post_tags for select using (true);
create policy "Post owners can manage their post tags" on public.post_tags for insert with check (
  auth.uid() = (select user_id from public.posts where id = post_id)
);
create policy "Post owners can delete their post tags" on public.post_tags for delete using (
  auth.uid() = (select user_id from public.posts where id = post_id)
);

-- Likes
alter table public.likes enable row level security;
create policy "Likes are viewable by everyone" on public.likes for select using (true);
create policy "Authenticated users can like posts" on public.likes for insert with check (auth.uid() = user_id);
create policy "Users can unlike posts they liked" on public.likes for delete using (auth.uid() = user_id);

-- Comments
alter table public.comments enable row level security;
create policy "Comments are viewable by everyone" on public.comments for select using (true);
create policy "Authenticated users can comment" on public.comments for insert with check (auth.uid() = user_id);
create policy "Users can delete their own comments" on public.comments for delete using (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- 7. OPTIONAL: SEED DATA (uncomment to add sample posts)
-- ────────────────────────────────────────────────────────────
-- insert into public.tags (name) values
--   ('philosophy'), ('poetry'), ('science'), ('stoicism'),
--   ('beauty'), ('time'), ('language'), ('nature'), ('mind');
