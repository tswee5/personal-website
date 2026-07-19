alter table reading add column if not exists progress_current integer;
alter table reading add column if not exists progress_total integer;
alter table reading add column if not exists progress_unit text check (progress_unit in ('pages', 'minutes', 'percent'));
alter table reading add column if not exists completed_at date;
