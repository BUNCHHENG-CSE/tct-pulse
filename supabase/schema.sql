-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. POSTS TABLE
create table if not exists public.posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  author_email text,
  title text not null,
  description text not null,
  category text not null default 'feature' check (category in ('feature', 'bug', 'improvement', 'integration')),
  status text not null default 'under_review' check (status in ('under_review', 'planned', 'in_progress', 'shipped')),
  upvotes_count integer not null default 1,
  admin_response text,
  target_quarter text,
  merged_into_id uuid references public.posts(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 2. UPVOTES TABLE
create table if not exists public.upvotes (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint unique_post_user_upvote unique (post_id, user_id)
);

-- 3. COMMENTS TABLE
create table if not exists public.comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  author_email text,
  content text not null,
  created_at timestamptz not null default now()
);

-- 4. CHANGELOGS TABLE
create table if not exists public.changelogs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  version text not null,
  title text not null,
  content text not null,
  tag text not null default 'new' check (tag in ('new', 'improved', 'fixed')),
  published_at timestamptz not null default now()
);

-- Indices for performance
create index if not exists idx_posts_status on public.posts(status);
create index if not exists idx_posts_category on public.posts(category);
create index if not exists idx_posts_created_at on public.posts(created_at desc);
create index if not exists idx_upvotes_post_id on public.upvotes(post_id);
create index if not exists idx_upvotes_user_id on public.upvotes(user_id);
create index if not exists idx_comments_post_id on public.comments(post_id);
create index if not exists idx_changelogs_published_at on public.changelogs(published_at desc);

-- 5. ROW LEVEL SECURITY (RLS)
alter table public.posts enable row level security;
alter table public.upvotes enable row level security;
alter table public.comments enable row level security;
alter table public.changelogs enable row level security;

-- Public SELECT policies (anyone can read)
create policy "Allow public select on posts"
  on public.posts for select
  using (true);

create policy "Allow public select on upvotes"
  on public.upvotes for select
  using (true);

create policy "Allow public select on comments"
  on public.comments for select
  using (true);

create policy "Allow public select on changelogs"
  on public.changelogs for select
  using (true);

-- Authenticated INSERT policies
create policy "Allow authenticated users to insert posts"
  on public.posts for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Allow authenticated users to insert upvotes"
  on public.upvotes for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Allow authenticated users to insert comments"
  on public.comments for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Allow authenticated users to insert changelogs"
  on public.changelogs for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Authenticated UPDATE policies
create policy "Allow authenticated users to update posts"
  on public.posts for update
  to authenticated
  using (true)
  with check (true);

create policy "Allow authenticated users to update upvotes"
  on public.upvotes for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Allow authenticated users to update comments"
  on public.comments for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Allow authenticated users to update changelogs"
  on public.changelogs for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Authenticated DELETE policies
create policy "Allow users to delete their own posts"
  on public.posts for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "Allow users to delete their own upvotes"
  on public.upvotes for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "Allow users to delete their own comments"
  on public.comments for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "Allow users to delete their own changelogs"
  on public.changelogs for delete
  to authenticated
  using (auth.uid() = user_id);
