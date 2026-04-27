-- Phase 1: handyman bids + invoices.
-- Bids attach to a task at proposal time; invoices attach when work is done.

create type public.bid_status as enum ('proposed', 'accepted', 'rejected');

create table public.task_bids (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  amount_cents integer not null check (amount_cents > 0),
  notes text,
  status public.bid_status not null default 'proposed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index task_bids_task_id_idx on public.task_bids (task_id);
create index task_bids_created_by_idx on public.task_bids (created_by);

alter table public.task_bids enable row level security;

create policy "bids visible to family + owner"
  on public.task_bids
  for select
  to authenticated
  using (not public.is_handyman());

create policy "handyman sees own bids"
  on public.task_bids
  for select
  to authenticated
  using (public.is_handyman() and created_by = auth.uid());

create policy "handyman creates bids on assigned tasks"
  on public.task_bids
  for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and exists (
      select 1 from public.tasks t
      where t.id = task_id and t.assigned_to = auth.uid()
    )
  );

create policy "creator updates own bid"
  on public.task_bids
  for update
  to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy "family + owner accept or reject bids"
  on public.task_bids
  for update
  to authenticated
  using (not public.is_handyman())
  with check (true);

create policy "creator deletes own bid"
  on public.task_bids
  for delete
  to authenticated
  using (created_by = auth.uid() and status = 'proposed');

create policy "owner deletes any bid"
  on public.task_bids
  for delete
  to authenticated
  using (public.is_owner());

create trigger task_bids_set_updated_at
  before update on public.task_bids
  for each row execute function public.set_updated_at();


create table public.task_invoices (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  amount_cents integer not null check (amount_cents > 0),
  notes text,
  paid_at timestamptz,
  payment_method text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index task_invoices_task_id_idx on public.task_invoices (task_id);
create index task_invoices_created_by_idx on public.task_invoices (created_by);
create index task_invoices_unpaid_idx on public.task_invoices (paid_at) where paid_at is null;

alter table public.task_invoices enable row level security;

create policy "invoices visible to family + owner"
  on public.task_invoices
  for select
  to authenticated
  using (not public.is_handyman());

create policy "handyman sees own invoices"
  on public.task_invoices
  for select
  to authenticated
  using (public.is_handyman() and created_by = auth.uid());

create policy "handyman creates invoices on assigned tasks"
  on public.task_invoices
  for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and exists (
      select 1 from public.tasks t
      where t.id = task_id and t.assigned_to = auth.uid()
    )
  );

create policy "creator updates own unpaid invoice"
  on public.task_invoices
  for update
  to authenticated
  using (created_by = auth.uid() and paid_at is null)
  with check (created_by = auth.uid());

create policy "family + owner mark invoices paid"
  on public.task_invoices
  for update
  to authenticated
  using (not public.is_handyman())
  with check (true);

create policy "creator deletes own unpaid invoice"
  on public.task_invoices
  for delete
  to authenticated
  using (created_by = auth.uid() and paid_at is null);

create policy "owner deletes any invoice"
  on public.task_invoices
  for delete
  to authenticated
  using (public.is_owner());

create trigger task_invoices_set_updated_at
  before update on public.task_invoices
  for each row execute function public.set_updated_at();
