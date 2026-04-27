# Phase 2 — Property OS

Status: APPROVED, not yet started
Date: 2026-04-27
Mode: Cathedral (selective expansion under CEO review)
Author: CEO review session, /plan-ceo-review

## Vision

After Phase 1 (calendar + tasks + bids), BlueLake is a family logbook. Phase 2 makes it a **Property OS**: an app that *knows* when the well pump is due, what model the dock pump is, and that we're out of salt. The hero moment is the dashboard saying "well pump service due in 12 days" and one tap turns that into a task assigned to Keith with the manual URL pre-attached.

## Scope

Three modules, one identity:

1. **Equipment registry** — what's on the property and what model/serial it is.
2. **Maintenance schedules** — recurring service cadence per piece of equipment.
3. **Shopping list** — daily-engagement layer (out of salt, propane, filters).

## Explicitly NOT in scope (deferred, with reason)

| Module | Why deferred |
|---|---|
| Documents | Reference shelf — low frequency, low engagement. Add when there's a real "I need the deed" moment, not before. |
| Vendors | Could live as notes on tasks for now. Rolodex-as-feature is overkill for 3 names (plumber, electrician, septic). |
| Inventory | Subsumed into shopping list with reorder thresholds *if* Dave asks. Don't build a separate table. |
| Checklists | Real workflow but seasonal (4×/year). Bigger build (templates → dated runs). Ship after Phase 2's three modules prove engagement. |

## Architecture — Linked

Three tables. The link from `maintenance_schedules` → `tasks` is the Property OS moment.

```
┌─────────────┐       ┌──────────────────────┐       ┌────────┐
│  equipment  │──1:N──│ maintenance_schedules│──1:N──│ tasks  │
│             │       │                       │       │        │
│ name        │       │ equipment_id  (FK)    │       │ schedule_id (FK, nullable)
│ category    │       │ name                  │       │ ...    │
│ model       │       │ interval_months       │       │        │
│ serial      │       │ last_completed_at     │       │        │
│ manual_url  │       │ next_due_at (generated│       │        │
│ install_dt  │       │   col or computed)    │       │        │
└─────────────┘       └──────────────────────┘       └────────┘

┌──────────────────┐
│ shopping_items   │   (independent — no equipment link)
│ name             │
│ added_by         │
│ picked_up_at     │
│ picked_up_by     │
└──────────────────┘
```

### Key flows

**Dashboard MaintenanceCard:**
- Reads top 3 schedules where `next_due_at <= now() + 30 days`, ordered by `next_due_at` ascending
- Each row shows equipment name, days-until-due, "Assign" button

**Schedule → task ("Assign" button):**
- Server action `createTaskFromSchedule(scheduleId)`:
  - Creates task with title `Service: {equipment.name}`, description includes model + manual_url + last service date
  - Sets `tasks.maintenance_schedule_id = scheduleId`
  - Returns task ID, redirect to /tasks/[id]
- When the linked task transitions to `done`, server-side hook updates `maintenance_schedules.last_completed_at = now()` so the cadence stays accurate

**Shopping list:**
- Quick-add input at top of /shopping
- Swipe (or button) to mark picked_up — moves to a "Picked up" section, not deleted (audit trail)
- Show active count somewhere (probably /more sidebar, not dashboard — dashboard already has 4 cards)

## Migration plan

One file: `supabase/migrations/20260501000000_phase2.sql`

- `equipment_category` enum: `hvac | septic | well | dock | generator | appliance | other`
- `equipment` table with RLS: read for all auth, insert/update by creator OR owner, delete owner-only
- `maintenance_schedules` table with FK to equipment, RLS same shape
- `shopping_items` table with RLS: read all auth, insert any auth user, update only by creator OR picker (mark picked_up), owner override
- ALTER `tasks` table: add `maintenance_schedule_id uuid REFERENCES maintenance_schedules(id) ON DELETE SET NULL` (nullable — most tasks won't have one)
- Add `next_due_at` to schedules: GENERATED ALWAYS AS `(last_completed_at + (interval_months * interval '1 month'))` STORED — no app-side date math

## File map (estimate)

```
supabase/migrations/20260501000000_phase2.sql

src/lib/types.ts                                  +Equipment, EquipmentCategory, MaintenanceSchedule, MaintenanceScheduleWithEquipment, ShoppingItem
src/lib/equipment.ts                              new — getEquipment, getEquipmentById
src/lib/maintenance.ts                            new — getDashboardSchedules, getSchedulesByEquipment, getScheduleById
src/lib/shopping.ts                               new — getActiveItems, getRecentlyPickedUp, getActiveCount

src/app/(app)/equipment/page.tsx                  list view, grouped by category
src/app/(app)/equipment/new/page.tsx              form
src/app/(app)/equipment/[id]/page.tsx             edit + linked schedules section
src/app/(app)/equipment/equipment-form.tsx        client component
src/app/(app)/equipment/actions.ts                createEquipment, updateEquipment, deleteEquipment

src/app/(app)/maintenance/page.tsx                all schedules across equipment, sorted by next_due
src/app/(app)/maintenance/new/page.tsx            form (with ?equipment_id= prefill)
src/app/(app)/maintenance/[id]/page.tsx           edit + assign-as-task button
src/app/(app)/maintenance/schedule-form.tsx       client component
src/app/(app)/maintenance/actions.ts              createSchedule, updateSchedule, deleteSchedule, createTaskFromSchedule

src/app/(app)/shopping/page.tsx                   list + quick-add + picked-up section
src/app/(app)/shopping/quick-add.tsx              client component (form at top)
src/app/(app)/shopping/actions.ts                 addItem, markPickedUp, undoPickedUp, deleteItem

src/app/(app)/page.tsx                            wire MaintenanceCard to live data
src/app/(app)/tasks/actions.ts                    on task→done transition, update schedules.last_completed_at if linked
src/app/(app)/more/page.tsx                       link list — equipment, maintenance, shopping
```

## RLS summary

| Table | Read | Insert | Update | Delete |
|---|---|---|---|---|
| equipment | all auth | family/owner | creator or owner | owner |
| maintenance_schedules | all auth | family/owner | creator or owner | owner |
| shopping_items | all auth | any auth | creator or picker | creator or owner |
| tasks (existing — adding `maintenance_schedule_id` only) | unchanged | unchanged | unchanged | unchanged |

Handyman role: read-only on equipment and schedules (so they can see context when looking at an assigned task), no insert/update/delete.

## Risks (named, accepted)

1. **HANDOFF.md line 333 violation.** Past-Dave wrote "Don't start Phase 2 until Phase 1 is in Dave's hands for a weekend." We're starting Phase 2 hours after Phase 1 ships. Mitigation: this plan is reversible — if Dave uses Phase 1 next weekend and finds it's the wrong shape, we revisit Phase 2 scope before deeper investment. Migrations can be rolled back; UI is additive (no existing surface degraded).
2. **Generated column for `next_due_at`** depends on `last_completed_at` being set. Schedules created without a baseline `last_completed_at` need a sensible default — probably `install_date` from equipment, or the schedule's own `created_at`.
3. **Task→schedule write-back** needs an idempotency story. If a task gets reopened and re-closed, do we update `last_completed_at` again? Decision: yes, only on transitions *into* `done` state, not on every save while already `done`.

## Build order (suggested)

1. Migration (one file, all 3 tables + tasks ALTER)
2. Apply via `supabase db push` (now possible without Dave)
3. Types + lib files (equipment, maintenance, shopping)
4. Equipment list + new + edit
5. Maintenance list + new + edit (depends on equipment for FK)
6. Dashboard MaintenanceCard live wiring
7. Schedule→task action
8. Tasks→done write-back hook
9. Shopping list (smallest, do it last as a palate cleanser)
10. /more sidebar links

Estimated CC effort: 2–3 hours. One push when each module is verifiable.

## Decisions made (CEO review)

- D1 → Cathedral path (over Wait, Minimum, Original)
- D2 → Linked architecture (over Lean, Fused)

Reasoning persisted in conversation transcript; this doc is the artifact.
