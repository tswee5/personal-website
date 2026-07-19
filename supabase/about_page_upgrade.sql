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

alter table about_page enable row level security;

drop policy if exists "public can read about_page" on about_page;
drop policy if exists "owner can manage about_page" on about_page;

create policy "public can read about_page" on about_page for select using (true);
create policy "owner can manage about_page" on about_page for all using (public.current_user_is_owner());

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
