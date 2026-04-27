-- Phase 1: stays table.
-- Tracks who is at the lake and when. Drives "Who's there now" + "Next stay"
-- on the dashboard, and the calendar month/list views.

create table public.stays (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  guest_name text,
  start_date date not null,
  end_date date not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stays_end_after_start check (end_date >= start_date)
);

create index stays_dates_idx on public.stays (start_date, end_date);
create index stays_user_id_idx on public.stays (user_id);

alter table public.stays enable row level security;

create policy "stays visible to authenticated users"
  on public.stays
  for select
  to authenticated
  using (true);

create policy "users can insert their own stays"
  on public.stays
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "users can update their own stays"
  on public.stays
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "users can delete their own stays"
  on public.stays
  for delete
  to authenticated
  using (user_id = auth.uid());

create policy "owners can update any stay"
  on public.stays
  for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'owner'
    )
  )
  with check (true);

create policy "owners can delete any stay"
  on public.stays
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'owner'
    )
  );

create trigger stays_set_updated_at
  before update on public.stays
  for each row execute function public.set_updated_at();
