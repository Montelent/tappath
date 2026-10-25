-- TapPath Supabase schema
-- Run in Supabase SQL Editor

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text not null default 'User',
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  color text default 'bg-blue-500',
  description text default '',
  guides_count int not null default 0,
  devices_count int not null default 0,
  product_lines jsonb not null default '[]'::jsonb,
  top_guides jsonb not null default '[]'::jsonb,
  devices_list jsonb not null default '[]'::jsonb,
  seo_updates text default '',
  seo_help text default '',
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text default '',
  icon text default 'book',
  guide_count int not null default 0,
  brands text[] not null default '{}',
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  brand_slug text not null,
  brand_name text not null,
  os text default '',
  href text not null,
  year int,
  image_url text,
  guides jsonb not null default '[]'::jsonb,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists devices_brand_idx on public.devices (brand_slug);

create table if not exists public.glossary_terms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  term text not null,
  category text not null default 'General',
  short text default '',
  definition text not null default '',
  related_guides jsonb not null default '[]'::jsonb,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.guides (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  brand text not null,
  brand_slug text not null,
  product_line text not null default '',
  title text not null,
  short_description text default '',
  updated_label text default '',
  read_time text default '2 min',
  category text default 'General',
  versions jsonb not null default '[]'::jsonb,
  article jsonb not null default '[]'::jsonb,
  faqs jsonb not null default '[]'::jsonb,
  related jsonb not null default '[]'::jsonb,
  compatible_devices jsonb not null default '[]'::jsonb,
  confirmations int not null default 0,
  forum_verified boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (brand_slug, product_line, slug)
);
create index if not exists guides_brand_idx on public.guides (brand_slug);

create table if not exists public.forum_topics (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  brand text not null default 'General',
  brand_slug text not null default 'general',
  category text not null default 'General',
  author_id uuid references public.profiles(id) on delete set null,
  author_name text not null default 'Anonymous',
  excerpt text default '',
  body text not null default '',
  solved boolean not null default false,
  views int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.forum_replies (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.forum_topics(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  author_name text not null default 'Anonymous',
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.guide_feedback (
  id uuid primary key default gen_random_uuid(),
  guide_slug text not null,
  user_id uuid references public.profiles(id) on delete set null,
  correct boolean not null,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'user')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.brands enable row level security;
alter table public.topics enable row level security;
alter table public.devices enable row level security;
alter table public.glossary_terms enable row level security;
alter table public.guides enable row level security;
alter table public.forum_topics enable row level security;
alter table public.forum_replies enable row level security;
alter table public.guide_feedback enable row level security;
alter table public.site_settings enable row level security;

create policy "Public read brands" on public.brands for select using (published = true);
create policy "Public read topics" on public.topics for select using (published = true);
create policy "Public read devices" on public.devices for select using (published = true);
create policy "Public read glossary" on public.glossary_terms for select using (published = true);
create policy "Public read guides" on public.guides for select using (published = true);
create policy "Public read forum topics" on public.forum_topics for select using (true);
create policy "Public read forum replies" on public.forum_replies for select using (true);
create policy "Public read settings" on public.site_settings for select using (true);
create policy "Anyone can insert feedback" on public.guide_feedback for insert with check (true);
create policy "Public read feedback" on public.guide_feedback for select using (true);
create policy "Auth insert forum topics" on public.forum_topics for insert with check (auth.uid() is not null);
create policy "Auth insert forum replies" on public.forum_replies for insert with check (auth.uid() is not null);

create policy "Admin all brands" on public.brands for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "Admin all topics" on public.topics for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "Admin all devices" on public.devices for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "Admin all glossary" on public.glossary_terms for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "Admin all guides" on public.guides for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "Admin all forum topics" on public.forum_topics for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "Admin all forum replies" on public.forum_replies for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "Admin all settings" on public.site_settings for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
