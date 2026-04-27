# Supabase

## Migrations

Files in `migrations/` are SQL files prefixed with a UTC timestamp. Apply them
in order to a fresh Supabase project. There are two practical paths:

### Option A — paste into the SQL editor (simplest for Phase 0)

1. Open your Supabase project → SQL Editor.
2. Paste the contents of each file in `migrations/` in order.
3. Click **Run**.

### Option B — Supabase CLI (recommended once we're past Phase 0)

```bash
npx supabase login
npx supabase link --project-ref <your-ref>
npx supabase db push
```

The `supabase` CLI is installed as a dev dependency so it's pinned to the
repo. No global install needed.

## Phase 0 schema

- `profiles` — one row per `auth.users`, with `role` (`owner`/`family`/`handyman`/`guest`).
- Trigger auto-creates a profile on signup (default role: `family`).
- RLS: everyone can read profiles; users update their own; owners can update any.
