create extension if not exists pgcrypto;

create table if not exists public.shared_reports (
  id uuid primary key default gen_random_uuid(),
  share_id text unique not null,
  report_text text not null,
  values_json jsonb,
  attachment_json jsonb,
  conflict_json jsonb,
  personality_json jsonb,
  ideal_partner_json jsonb,
  created_at timestamptz default now()
);

alter table public.shared_reports enable row level security;

drop policy if exists "shared reports public select by share id" on public.shared_reports;
create policy "shared reports public select by share id"
  on public.shared_reports
  for select
  to anon, authenticated
  using (share_id is not null);

drop policy if exists "shared reports public insert" on public.shared_reports;
create policy "shared reports public insert"
  on public.shared_reports
  for insert
  to anon, authenticated
  with check (share_id is not null and report_text is not null);
