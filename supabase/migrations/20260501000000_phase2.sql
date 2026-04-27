-- Phase 2: Property OS — equipment, maintenance schedules, shopping list.
-- Schedule -> task link enables the dashboard "Assign" hero moment.

create type public.equipment_category as enum (
  'hvac',
  'septic',
  'well',
  'dock',
  'generator',
  'appliance',
  'other'
);

create table public.equipment (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category public.equipment_category not null default 'other',
  model text,
  serial text,
  install_date date,
  manual_url text,
  notes text,
  created_by uuid not null references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint equipment_name_not_blank check (length(trim(name)) > 0)
);

create index equipment_category_idx on public.equipment (category);

create trigger equipment_set_updated_at
  before update on public.equipment
  for each row execute function public.set_updated_at();

alter table public.equipment enable row level security;

create policy "equipment visible to all auth users"
  on public.equipment
  for select
  to authenticated
  using (true);

create policy "family + owner can insert equipment"
  on public.equipment
  for insert
  to authenticated
  with check (not public.is_handyman() and created_by = auth.uid());

create policy "creator can update equipment"
  on public.equipment
  for update
  to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy "owner can update any equipment"
  on public.equipment
  for update
  to authenticated
  using (public.is_owner())
  with check (true);

create policy "owner can delete equipment"
  on public.equipment
  for delete
  to authenticated
  using (public.is_owner());


create table public.maintenance_schedules (
  id uuid primary key default gen_random_uuid(),
  equipment_id uuid not null references public.equipment(id) on delete cascade,
  name text not null,
  interval_months integer not null,
  last_completed_at timestamptz not null default now(),
  next_due_at timestamptz not null,
  notes text,
  created_by uuid not null references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint maintenance_schedules_name_not_blank check (length(trim(name)) > 0),
  constraint maintenance_schedules_interval_positive check (interval_months > 0)
);

create index maintenance_schedules_equipment_idx on public.maintenance_schedules (equipment_id);
create index maintenance_schedules_next_due_idx on public.maintenance_schedules (next_due_at);

create or replace function public.set_schedule_next_due()
returns trigger
language plpgsql
as $$
begin
  new.next_due_at = new.last_completed_at + make_interval(months => new.interval_months);
  return new;
end;
$$;

create trigger maintenance_schedules_set_next_due
  before insert or update of last_completed_at, interval_months
  on public.maintenance_schedules
  for each row execute function public.set_schedule_next_due();

create trigger maintenance_schedules_set_updated_at
  before update on public.maintenance_schedules
  for each row execute function public.set_updated_at();

alter table public.maintenance_schedules enable row level security;

create policy "schedules visible to all auth users"
  on public.maintenance_schedules
  for select
  to authenticated
  using (true);

create policy "family + owner can insert schedules"
  on public.maintenance_schedules
  for insert
  to authenticated
  with check (not public.is_handyman() and created_by = auth.uid());

create policy "creator can update schedules"
  on public.maintenance_schedules
  for update
  to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy "owner can update any schedule"
  on public.maintenance_schedules
  for update
  to authenticated
  using (public.is_owner())
  with check (true);

create policy "owner can delete schedules"
  on public.maintenance_schedules
  for delete
  to authenticated
  using (public.is_owner());


alter table public.tasks
  add column maintenance_schedule_id uuid references public.maintenance_schedules(id) on delete set null;

create index tasks_maintenance_schedule_idx on public.tasks (maintenance_schedule_id)
  where maintenance_schedule_id is not null;


-- Write-back: when a task linked to a schedule transitions into 'done',
-- bump the schedule's last_completed_at so next_due_at recomputes.
-- Only fires on the transition into done, not on every save while already done.
create or replace function public.update_schedule_on_task_done()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'done'
     and old.status is distinct from 'done'
     and new.maintenance_schedule_id is not null then
    update public.maintenance_schedules
       set last_completed_at = now()
     where id = new.maintenance_schedule_id;
  end if;
  return new;
end;
$$;

create trigger tasks_update_schedule_on_done
  after update of status on public.tasks
  for each row execute function public.update_schedule_on_task_done();


create table public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  notes text,
  added_by uuid not null references auth.users(id) on delete set null,
  picked_up_at timestamptz,
  picked_up_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint shopping_items_name_not_blank check (length(trim(name)) > 0),
  constraint shopping_items_pickup_consistent check (
    (picked_up_at is null and picked_up_by is null)
    or (picked_up_at is not null and picked_up_by is not null)
  )
);

create index shopping_items_active_idx on public.shopping_items (created_at)
  where picked_up_at is null;
create index shopping_items_picked_up_idx on public.shopping_items (picked_up_at)
  where picked_up_at is not null;

create trigger shopping_items_set_updated_at
  before update on public.shopping_items
  for each row execute function public.set_updated_at();

alter table public.shopping_items enable row level security;

create policy "shopping items visible to all auth users"
  on public.shopping_items
  for select
  to authenticated
  using (true);

create policy "any auth user can add shopping items"
  on public.shopping_items
  for insert
  to authenticated
  with check (added_by = auth.uid());

create policy "any auth user can update shopping items"
  on public.shopping_items
  for update
  to authenticated
  using (true)
  with check (true);

create policy "creator can delete shopping items"
  on public.shopping_items
  for delete
  to authenticated
  using (added_by = auth.uid());

create policy "owner can delete any shopping item"
  on public.shopping_items
  for delete
  to authenticated
  using (public.is_owner());
