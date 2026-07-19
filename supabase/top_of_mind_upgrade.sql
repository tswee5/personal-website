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

alter table top_of_mind enable row level security;

drop policy if exists "public can read published top_of_mind" on top_of_mind;
drop policy if exists "owner can manage top_of_mind" on top_of_mind;

create policy "public can read published top_of_mind" on top_of_mind for select using (published = true);
create policy "owner can manage top_of_mind" on top_of_mind for all using ((select is_owner from profiles where id = auth.uid()));
