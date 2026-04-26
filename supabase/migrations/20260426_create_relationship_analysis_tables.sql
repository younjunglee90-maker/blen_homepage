create extension if not exists pgcrypto;

create table if not exists public.relationship_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  analysis_json jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.report_shares (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.relationship_reports(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  shared_with_user_id uuid references auth.users(id) on delete set null,
  share_token text unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.compatibility_results (
  id uuid primary key default gen_random_uuid(),
  user_a_id uuid not null references auth.users(id) on delete cascade,
  user_b_id uuid not null references auth.users(id) on delete cascade,
  report_a_id uuid not null references public.relationship_reports(id) on delete cascade,
  report_b_id uuid not null references public.relationship_reports(id) on delete cascade,
  compatibility_json jsonb not null,
  score numeric,
  created_at timestamptz not null default now()
);

create index if not exists relationship_reports_user_id_created_at_idx
  on public.relationship_reports (user_id, created_at desc);

create index if not exists report_shares_owner_user_id_idx
  on public.report_shares (owner_user_id);

create index if not exists report_shares_report_id_idx
  on public.report_shares (report_id);

create index if not exists compatibility_results_users_idx
  on public.compatibility_results (user_a_id, user_b_id, created_at desc);

alter table public.relationship_reports enable row level security;
alter table public.report_shares enable row level security;
alter table public.compatibility_results enable row level security;

drop policy if exists relationship_reports_select_own on public.relationship_reports;
create policy relationship_reports_select_own
  on public.relationship_reports
  for select
  using (auth.uid() = user_id);

drop policy if exists relationship_reports_insert_own on public.relationship_reports;
create policy relationship_reports_insert_own
  on public.relationship_reports
  for insert
  with check (auth.uid() = user_id);

drop policy if exists relationship_reports_update_own on public.relationship_reports;
create policy relationship_reports_update_own
  on public.relationship_reports
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists relationship_reports_delete_own on public.relationship_reports;
create policy relationship_reports_delete_own
  on public.relationship_reports
  for delete
  using (auth.uid() = user_id);

drop policy if exists report_shares_select_participants on public.report_shares;
create policy report_shares_select_participants
  on public.report_shares
  for select
  using (
    auth.uid() = owner_user_id
    or auth.uid() = shared_with_user_id
  );

drop policy if exists report_shares_insert_owner_only on public.report_shares;
create policy report_shares_insert_owner_only
  on public.report_shares
  for insert
  with check (
    auth.uid() = owner_user_id
    and exists (
      select 1
      from public.relationship_reports rr
      where rr.id = report_id
        and rr.user_id = auth.uid()
    )
  );

drop policy if exists report_shares_update_owner_only on public.report_shares;
create policy report_shares_update_owner_only
  on public.report_shares
  for update
  using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

drop policy if exists report_shares_delete_owner_only on public.report_shares;
create policy report_shares_delete_owner_only
  on public.report_shares
  for delete
  using (auth.uid() = owner_user_id);

drop policy if exists compatibility_results_select_involved on public.compatibility_results;
create policy compatibility_results_select_involved
  on public.compatibility_results
  for select
  using (auth.uid() = user_a_id or auth.uid() = user_b_id);

drop policy if exists compatibility_results_insert_involved on public.compatibility_results;
create policy compatibility_results_insert_involved
  on public.compatibility_results
  for insert
  with check (auth.uid() = user_a_id or auth.uid() = user_b_id);

drop policy if exists compatibility_results_update_involved on public.compatibility_results;
create policy compatibility_results_update_involved
  on public.compatibility_results
  for update
  using (auth.uid() = user_a_id or auth.uid() = user_b_id)
  with check (auth.uid() = user_a_id or auth.uid() = user_b_id);

drop policy if exists compatibility_results_delete_involved on public.compatibility_results;
create policy compatibility_results_delete_involved
  on public.compatibility_results
  for delete
  using (auth.uid() = user_a_id or auth.uid() = user_b_id);
