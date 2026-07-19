create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'content_kind') then
    create type content_kind as enum ('project', 'writing', 'reading', 'interest');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'project_status') then
    create type project_status as enum ('Idea', 'Active', 'Paused', 'Completed');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'writing_kind') then
    create type writing_kind as enum ('Essay', 'Note', 'Mental Model', 'Book Note', 'Article Response', 'Interview Reflection');
  end if;
end $$;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  is_owner boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

create table if not exists interests (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  overview text not null,
  key_questions text[] not null default '{}',
  favorite_books text[] not null default '{}',
  favorite_articles jsonb not null default '[]',
  favorite_thinkers text[] not null default '{}',
  current_thoughts text not null default '',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  status project_status not null default 'Idea',
  start_date date,
  end_date date,
  featured_image_path text,
  completed_at date,
  problem text,
  solution text,
  architecture text[] not null default '{}',
  lessons_learned text[] not null default '{}',
  roadmap text[] not null default '{}',
  links jsonb not null default '[]',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists writing (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  type writing_kind not null default 'Note',
  title text not null,
  subtitle text,
  body_mdx text not null default '',
  reading_time text,
  published_at timestamptz,
  draft boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists reading (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  author text,
  source_url text,
  source_name text,
  thumbnail_path text,
  date_read date,
  category text,
  summary text,
  key_takeaways text[] not null default '{}',
  personal_thoughts text,
  rating integer check (rating between 1 and 5),
  read_depth text check (read_depth in ('surface', 'deep_dive', 'reference')),
  triage_status text check (triage_status in ('inbox', 'queued', 'reading', 'done', 'archived')),
  reading_priority text check (reading_priority in ('low', 'normal', 'high')),
  reading_intent text,
  decision text check (decision in ('keep', 'maybe', 'purge')),
  progress_current integer,
  progress_total integer,
  progress_unit text check (progress_unit in ('pages', 'minutes', 'percent')),
  completed_at date,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists top_of_mind (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  url text,
  link_label text,
  sort_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists about_page (
  id uuid primary key default gen_random_uuid(),
  headline text not null default 'About',
  bio text not null default '',
  "current_role" text,
  location text,
  timeline jsonb not null default '[]',
  skills text not null default '',
  selected_work text not null default '',
  education text not null default '',
  personal_interests text not null default '',
  contact_email text,
  github_url text,
  linkedin_url text,
  updated_at timestamptz not null default now()
);

create table if not exists content_tags (
  tag_id uuid not null references tags(id) on delete cascade,
  content_kind content_kind not null,
  content_id uuid not null,
  primary key (tag_id, content_kind, content_id)
);

create table if not exists content_relationships (
  id uuid primary key default gen_random_uuid(),
  from_kind content_kind not null,
  from_id uuid not null,
  to_kind content_kind not null,
  to_id uuid not null,
  label text,
  created_at timestamptz not null default now(),
  unique (from_kind, from_id, to_kind, to_id)
);

create or replace function public.current_user_is_owner()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from profiles
    where id = auth.uid()
      and is_owner = true
  );
$$;

alter table reading add column if not exists read_depth text check (read_depth in ('surface', 'deep_dive', 'reference'));
alter table reading add column if not exists triage_status text check (triage_status in ('inbox', 'queued', 'reading', 'done', 'archived'));
alter table reading add column if not exists reading_priority text check (reading_priority in ('low', 'normal', 'high'));
alter table reading add column if not exists reading_intent text;
alter table reading add column if not exists decision text check (decision in ('keep', 'maybe', 'purge'));
alter table reading add column if not exists progress_current integer;
alter table reading add column if not exists progress_total integer;
alter table reading add column if not exists progress_unit text check (progress_unit in ('pages', 'minutes', 'percent'));
alter table reading add column if not exists completed_at date;
alter table projects add column if not exists completed_at date;

drop materialized view if exists search_index;

create materialized view search_index as
select 'project'::content_kind as kind, id, slug, title, description as excerpt,
  to_tsvector('english', title || ' ' || description || ' ' || coalesce(problem, '') || ' ' || coalesce(solution, '')) as document
from projects where published = true
union all
select 'writing'::content_kind, id, slug, title, coalesce(subtitle, ''),
  to_tsvector('english', title || ' ' || coalesce(subtitle, '') || ' ' || body_mdx)
from writing where draft = false
union all
select 'reading'::content_kind, id, slug, title, coalesce(summary, ''),
  to_tsvector('english', title || ' ' || coalesce(author, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(personal_thoughts, ''))
from reading where published = true
union all
select 'interest'::content_kind, id, slug, title, overview,
  to_tsvector('english', title || ' ' || overview || ' ' || current_thoughts)
from interests where published = true;

create index if not exists search_index_document_idx on search_index using gin(document);

alter table profiles enable row level security;
alter table tags enable row level security;
alter table interests enable row level security;
alter table projects enable row level security;
alter table writing enable row level security;
alter table reading enable row level security;
alter table top_of_mind enable row level security;
alter table about_page enable row level security;
alter table content_tags enable row level security;
alter table content_relationships enable row level security;

drop policy if exists "public can read published interests" on interests;
drop policy if exists "public can read published projects" on projects;
drop policy if exists "public can read published writing" on writing;
drop policy if exists "public can read published reading" on reading;
drop policy if exists "public can read published top_of_mind" on top_of_mind;
drop policy if exists "public can read about_page" on about_page;
drop policy if exists "public can read tags" on tags;
drop policy if exists "public can read relationships" on content_relationships;
drop policy if exists "public can read tag joins" on content_tags;
drop policy if exists "owner can manage profiles" on profiles;
drop policy if exists "owner can manage tags" on tags;
drop policy if exists "owner can manage interests" on interests;
drop policy if exists "owner can manage projects" on projects;
drop policy if exists "owner can manage writing" on writing;
drop policy if exists "owner can manage reading" on reading;
drop policy if exists "owner can manage top_of_mind" on top_of_mind;
drop policy if exists "owner can manage about_page" on about_page;
drop policy if exists "owner can manage content_tags" on content_tags;
drop policy if exists "owner can manage content_relationships" on content_relationships;

create policy "public can read published interests" on interests for select using (published = true);
create policy "public can read published projects" on projects for select using (published = true);
create policy "public can read published writing" on writing for select using (draft = false);
create policy "public can read published reading" on reading for select using (published = true);
create policy "public can read published top_of_mind" on top_of_mind for select using (published = true);
create policy "public can read about_page" on about_page for select using (true);
create policy "public can read tags" on tags for select using (true);
create policy "public can read relationships" on content_relationships for select using (true);
create policy "public can read tag joins" on content_tags for select using (true);

create policy "owner can manage profiles" on profiles for all using (public.current_user_is_owner());
create policy "owner can manage tags" on tags for all using (public.current_user_is_owner());
create policy "owner can manage interests" on interests for all using (public.current_user_is_owner());
create policy "owner can manage projects" on projects for all using (public.current_user_is_owner());
create policy "owner can manage writing" on writing for all using (public.current_user_is_owner());
create policy "owner can manage reading" on reading for all using (public.current_user_is_owner());
create policy "owner can manage top_of_mind" on top_of_mind for all using (public.current_user_is_owner());
create policy "owner can manage about_page" on about_page for all using (public.current_user_is_owner());
create policy "owner can manage content_tags" on content_tags for all using (public.current_user_is_owner());
create policy "owner can manage content_relationships" on content_relationships for all using (public.current_user_is_owner());
