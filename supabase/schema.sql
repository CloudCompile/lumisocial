-- Create users table
create table if not exists public.users (
  id uuid primary key default auth.uid(),
  email text unique not null,
  username text unique not null,
  avatar_url text,
  bio text,
  created_at timestamp with time zone default now()
);

-- Create posts table
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  media_url text not null,
  media_type text not null check (media_type in ('image', 'video')),
  caption text,
  created_at timestamp with time zone default now()
);

-- Create likes table
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(user_id, post_id)
);

-- Create comments table
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default now()
);

-- Create follows table
create table if not exists public.follows (
  follower_id uuid not null references public.users(id) on delete cascade,
  following_id uuid not null references public.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  primary key (follower_id, following_id),
  check (follower_id != following_id)
);

-- Create indexes for better query performance
create index idx_posts_user_id on public.posts(user_id);
create index idx_posts_created_at on public.posts(created_at desc);
create index idx_likes_user_id on public.likes(user_id);
create index idx_likes_post_id on public.likes(post_id);
create index idx_comments_post_id on public.comments(post_id);
create index idx_comments_user_id on public.comments(user_id);
create index idx_follows_follower_id on public.follows(follower_id);
create index idx_follows_following_id on public.follows(following_id);

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.posts enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.follows enable row level security;

-- RLS Policies for users table
create policy "Public profiles are viewable by everyone"
  on public.users for select
  using (true);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.users for insert
  with check (auth.uid() = id);

-- RLS Policies for posts table
create policy "Anyone can view posts"
  on public.posts for select
  using (true);

create policy "Users can create posts"
  on public.posts for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own posts"
  on public.posts for delete
  using (auth.uid() = user_id);

-- RLS Policies for likes table
create policy "Anyone can view likes"
  on public.likes for select
  using (true);

create policy "Users can like posts"
  on public.likes for insert
  with check (auth.uid() = user_id);

create policy "Users can unlike posts"
  on public.likes for delete
  using (auth.uid() = user_id);

-- RLS Policies for comments table
create policy "Anyone can view comments"
  on public.comments for select
  using (true);

create policy "Users can create comments"
  on public.comments for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own comments or comments on their posts"
  on public.comments for delete
  using (
    auth.uid() = user_id
    or auth.uid() = (select user_id from public.posts where id = post_id)
  );

-- RLS Policies for follows table
create policy "Anyone can view follows"
  on public.follows for select
  using (true);

create policy "Users can follow others"
  on public.follows for insert
  with check (auth.uid() = follower_id);

create policy "Users can unfollow others"
  on public.follows for delete
  using (auth.uid() = follower_id);
