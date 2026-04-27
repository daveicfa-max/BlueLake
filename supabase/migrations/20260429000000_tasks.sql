-- Phase 1: tasks table + role helper.
-- Tracks seasonal work, handyman assignments, and general to-dos.

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'owner'
  );
$$;

create or replace function public.is_handyman()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'handyman'
  );
$$;

create type public.task_status as enum (
  'open',
  'in_progress',
  'done',
  'cancelled'
);

create type public.task_priority as enum ('low', 'normal', 'high');

create type public.task_season as enum (
  'open',
  'close',
  'spring',
  'summer',
  'fall',
  'winter'
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status public.task_status not null default 'open',
  priority public.task_priority not null default 'normal',
  assigned_to uuid references auth.users(id) on delete set null,
  due_date date,
  is_seasonal boolean not null default false,
  season public.task_season,
  created_by uuid not null references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_title_not_blank check (length(trim(title)) > 0),
  constraint tasks_seasonal_has_season check (
    (is_seasonal = false) or (season is not null)
  )
);

create index tasks_status_idx on public.tasks (status);
create index tasks_assigned_to_idx on public.tasks (assigned_to);
create index tasks_due_date_idx on public.tasks (due_date);
create index tasks_seasonal_idx on public.tasks (is_seasonal) where is_seasonal = true;

alter table public.tasks enable row level security;

create policy "tasks visible to family + owner"
  on public.tasks
  for select
  to authenticated
  using (not public.is_handyman());

create policy "handyman sees only their assigned tasks"
  on public.tasks
  for select
  to authenticated
  using (public.is_handyman() and assigned_to = auth.uid());

create policy "family + owner can insert tasks"
  on public.tasks
  for insert
  to authenticated
  with check (not public.is_handyman() and created_by = auth.uid());

create policy "creator + assignee can update their tasks"
  on public.tasks
  for update
  to authenticated
  using (created_by = auth.uid() or assigned_to = auth.uid())
  with check (created_by = auth.uid() or assigned_to = auth.uid());

create policy "owner can update any task"
  on public.tasks
  for update
  to authenticated
  using (public.is_owner())
  with check (true);

create policy "creator can delete their tasks"
  on public.tasks
  for delete
  to authenticated
  using (created_by = auth.uid());

create policy "owner can delete any task"
  on public.tasks
  for delete
  to authenticated
  using (public.is_owner());

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();
