alter table reading add column if not exists read_depth text check (read_depth in ('surface', 'deep_dive', 'reference'));
alter table reading add column if not exists triage_status text check (triage_status in ('inbox', 'queued', 'reading', 'done', 'archived'));
alter table reading add column if not exists reading_priority text check (reading_priority in ('low', 'normal', 'high'));
alter table reading add column if not exists reading_intent text;
alter table reading add column if not exists decision text check (decision in ('keep', 'maybe', 'purge'));
