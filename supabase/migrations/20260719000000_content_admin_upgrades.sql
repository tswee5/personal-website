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
  bio text not null,
  "current_role" text,
  location text,
  timeline jsonb not null default '[]',
  skills text not null,
  selected_work text not null,
  education text not null,
  personal_interests text not null,
  contact_email text,
  github_url text,
  linkedin_url text,
  updated_at timestamptz not null default now()
);

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

alter table top_of_mind enable row level security;
alter table about_page enable row level security;

drop policy if exists "public can read published top_of_mind" on top_of_mind;
drop policy if exists "public can read about_page" on about_page;
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

create policy "public can read published top_of_mind" on top_of_mind for select using (published = true);
create policy "public can read about_page" on about_page for select using (true);
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

insert into about_page (
  headline,
  bio,
  "current_role",
  timeline,
  skills,
  selected_work,
  education,
  personal_interests
)
select
  'About',
  $$I am an engineer interested in the overlap between software, knowledge, institutions, and the habits that let people do clearer work.$$,
  $$Building personal knowledge tools and publishing systems.$$,
  $$[
    {"date": "Now", "body": "Building personal knowledge tools and publishing systems."},
    {"date": "2025", "body": "Focused on reader workflows, AI-assisted interfaces, and durable notes."},
    {"date": "Earlier", "body": "Worked across product engineering, web systems, and data-heavy applications."}
  ]$$::jsonb,
  $$TypeScript, React, Next.js, Node, Postgres, Supabase, product engineering, systems thinking, writing, technical discovery.$$,
  $$Projects, products, and systems that connect software, learning, and durable knowledge work.$$,
  $$A living mix of formal study, shipped software, books, essays, and carefully chosen rabbit holes.$$,
  $$Politics, science, business, entrepreneurship, technology, culture, sports, economics, history, psychology, and AI.$$
where not exists (select 1 from about_page);
