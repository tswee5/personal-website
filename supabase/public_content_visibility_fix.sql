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

alter table reading add column if not exists progress_current integer;
alter table reading add column if not exists progress_total integer;
alter table reading add column if not exists progress_unit text check (progress_unit in ('pages', 'minutes', 'percent'));
alter table reading add column if not exists completed_at date;
alter table projects add column if not exists completed_at date;

drop policy if exists "owner can manage profiles" on profiles;
drop policy if exists "owner can manage tags" on tags;
drop policy if exists "owner can manage interests" on interests;
drop policy if exists "owner can manage projects" on projects;
drop policy if exists "owner can manage writing" on writing;
drop policy if exists "owner can manage reading" on reading;
drop policy if exists "owner can manage top_of_mind" on top_of_mind;
drop policy if exists "owner can manage content_tags" on content_tags;
drop policy if exists "owner can manage content_relationships" on content_relationships;

create policy "owner can manage profiles" on profiles for all using (public.current_user_is_owner());
create policy "owner can manage tags" on tags for all using (public.current_user_is_owner());
create policy "owner can manage interests" on interests for all using (public.current_user_is_owner());
create policy "owner can manage projects" on projects for all using (public.current_user_is_owner());
create policy "owner can manage writing" on writing for all using (public.current_user_is_owner());
create policy "owner can manage reading" on reading for all using (public.current_user_is_owner());
create policy "owner can manage top_of_mind" on top_of_mind for all using (public.current_user_is_owner());
create policy "owner can manage content_tags" on content_tags for all using (public.current_user_is_owner());
create policy "owner can manage content_relationships" on content_relationships for all using (public.current_user_is_owner());
