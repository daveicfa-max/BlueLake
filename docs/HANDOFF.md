# Blue Lake — Agent Handoff

You are picking up an in-progress build. Read this top to bottom before
touching code. Everything you need to be useful on day one is here.

---

## 1. What this project is

**Blue Lake** is a custom, mobile-first iOS PWA for managing Dave's family
lakehouse in northern Michigan. It consolidates property operations into one
shared place for the family + handyman.

**Owner / primary user:** Dave (`dave@plangap.com`). Technical builder — chose
the stack himself; treat him as a capable owner, not a beginner.

**Other users:**
- Mom + brother → `family` role
- Handyman → `handyman` role (scoped: only assigned tasks + invoice entry)
- Future: `guest` role (read-only stays/calendar)

**Core scope (across all phases):**
- Family calendar with stay tracking ("who's there now")
- Seasonal task management
- Handyman task assignment + bid/payment tracking
- Bank of America property-account expense tracking
- Nest cameras + thermostat integration
- Weather (northern Michigan)
- Equipment registry, maintenance schedule, inventory, shopping list,
  checklists, documents, vendors

---

## 2. Stack — read carefully, versions matter

| Layer | Choice |
|---|---|
| Framework | **Next.js 16.2.4** (App Router, Turbopack) |
| React | **19.2.4** |
| Language | TypeScript 5 |
| Styling | **Tailwind CSS v4** + `tw-animate-css` |
| Components | **shadcn/ui** with **base-ui** preset (`@base-ui/react`) |
| Forms | `react-hook-form` + `zod` + `@hookform/resolvers` |
| Data fetching | `@tanstack/react-query` (installed, not yet wired) |
| Dates | `date-fns` + `date-fns-tz` |
| Icons | `lucide-react` |
| Toasts | `sonner` |
| Theme | `next-themes` |
| Backend | **Supabase** — Postgres, Auth (magic link), Storage, Realtime, Edge Functions |
| Hosting | Vercel |
| Notifications (later) | Web Push + service worker |

### Next.js 16 gotchas — DO NOT skip

The repo's `AGENTS.md` says it bluntly: **this is not the Next.js you were
trained on.** Before writing Next-specific code, read the relevant guide in
`node_modules/next/dist/docs/`. Concrete things that will bite you:

- **`proxy.ts` replaces `middleware.ts`.** The file lives at `src/proxy.ts`
  and exports a `proxy()` function (not `middleware()`). Same matcher config
  shape.
- **`cookies()`, `headers()`, `params`, `searchParams` are all async.** Always
  `await` them.
- React 19.2 — Server Components / Server Actions are the default; client
  components are explicit `"use client"`.

`CLAUDE.md` is just `@AGENTS.md` (one-line include). Edit `AGENTS.md` for
agent-facing rules.

---

## 3. Current state — what's shipped (Phase 0)

Git: 2 commits. Latest is `b6d4024 Phase 0: auth, app shell, PWA scaffolding`.

### Done

- **Magic-link auth** end to end:
  - `src/app/login/` — server action + form
  - `src/app/auth/callback/route.ts` — code exchange
  - `src/app/auth/error/page.tsx`, `src/app/auth/sign-out/route.ts`
  - `src/lib/supabase/{client,server,proxy}.ts` — three clients (browser,
    server component / route handler, proxy edge)
  - `src/proxy.ts` — refreshes Supabase session cookie on every request
- **Protected app shell** under `src/app/(app)/`:
  - `layout.tsx` redirects unauthenticated users to `/login`
  - `AppHeader` (`src/components/app-header.tsx`)
  - `BottomNav` (`src/components/bottom-nav.tsx`) — 5 tabs:
    Home / Calendar / Tasks / Cameras / More
- **Placeholder pages** (each shows which phase it lights up in):
  - `/` dashboard with 4 cards (Who's there, Open tasks, Weather, Maintenance)
  - `/calendar`, `/tasks`, `/cameras`
  - `/more` — link list to all secondary sections (equipment, maintenance,
    inventory, shopping, checklists, documents, expenses, vendors,
    thermostat, family, settings)
- **PWA manifest** (`src/app/manifest.ts`) — name, theme `#0b1220`, standalone
  portrait. Icons referenced but not yet present (see TODOs).
- **shadcn primitives installed:** `button`, `card`, `input`, `label`,
  `sonner`. Pull more with `npx shadcn@latest add <component>`.
- **Supabase migration** (`supabase/migrations/20260427000000_init_profiles.sql`):
  - `app_role` enum: `owner | family | handyman | guest`
  - `profiles` table (1:1 with `auth.users`) with `full_name`, `role`,
    `phone`, `avatar_url`, emergency contact fields, timestamps
  - RLS: everyone reads, users update their own row, owners can update any
  - Trigger `handle_new_user()` auto-creates a profile on signup
    (default role: `family`)
  - Trigger `set_updated_at()` keeps `updated_at` fresh
- `.env.local` exists locally (not committed); `.env.local.example` is the
  template.

### Phase 0 TODOs still open

1. **PWA icons** — `public/ICONS.todo` lists what's needed
   (`icon-192.png`, `icon-512.png`, `icon-maskable-512.png`,
   `apple-touch-icon.png`). Without them iOS shows a generic screenshot.
2. **Vercel env vars** — set the four vars from `.env.local.example` in
   Production / Preview / Development.
3. **Supabase auth redirect URLs** — add `http://localhost:3000/auth/callback`
   and the production / preview URLs in Supabase → Authentication → URL
   Configuration.
4. **First owner promotion** — every new user defaults to `family`. After
   Dave's first sign-in, manually update his row to `role = 'owner'` (SQL
   editor). After that, owners can promote others.
5. **Apply migration** — if running on a fresh Supabase project, either paste
   the SQL or `npx supabase link --project-ref <ref> && npx supabase db push`
   (the CLI is a dev dependency).

---

## 4. Project layout

```
src/
  app/
    (app)/                 protected app shell (auth-gated layout)
      layout.tsx           redirects to /login if no user
      page.tsx             dashboard (Home tab)
      calendar/page.tsx    Phase 1
      tasks/page.tsx       Phase 1
      cameras/page.tsx     Phase 4
      more/page.tsx        link list to Phase 2-5 sections
    auth/
      callback/route.ts    OAuth/magic-link code exchange
      error/page.tsx
      sign-out/route.ts
    login/
      page.tsx
      login-form.tsx
      actions.ts           server action: signInWithOtp
    layout.tsx             root: metadata, viewport, theme
    manifest.ts            PWA manifest
    globals.css            Tailwind v4 entry
    favicon.ico
  components/
    app-header.tsx
    bottom-nav.tsx
    ui/                    shadcn primitives (button, card, input, label, sonner)
  lib/
    supabase/
      client.ts            browser client
      server.ts            server-component / route-handler client
      proxy.ts             session-refresh helper used by src/proxy.ts
    utils.ts               cn helper
  proxy.ts                 Next 16 proxy (NOT middleware.ts)
public/
  ICONS.todo               icon requirements
supabase/
  README.md                how to apply migrations
  migrations/
    20260427000000_init_profiles.sql
.env.local                 local secrets (gitignored)
.env.local.example         template
AGENTS.md                  Next 16 warning to agents
CLAUDE.md                  one-liner: @AGENTS.md
README.md                  human-facing setup
```

---

## 5. Phased plan

The README points readers here for the phase plan. Here it is.

### Phase 0 — Foundation ✅ (shipped)
Auth, app shell, bottom nav, profiles + RLS, PWA manifest scaffolding.

### Phase 1 — Calendar + Tasks + Handyman flow (next up)
**Goal:** the family can see who's at the lake and assign work.

- **Calendar / stays**
  - `stays` table: `id`, `user_id` (creator), `guest_name?`, `start_date`,
    `end_date`, `notes`, timestamps
  - Month view + list view; "who's there now" card on dashboard reads from this
  - RLS: family + owner read all; users edit their own; owners edit any
- **Tasks**
  - `tasks` table: `id`, `title`, `description`, `status`
    (`open|in_progress|done|cancelled`), `priority`, `assigned_to` (uuid),
    `due_date?`, `created_by`, `is_seasonal` (bool), `season?`
    (`open|close|spring|summer|fall|winter`), timestamps
  - Task list filtered by tab: Mine / All / Handyman / Seasonal
  - Assign to handyman → handyman sees only their assigned tasks (RLS)
- **Handyman bids/invoices**
  - `task_bids` table: `task_id`, `amount_cents`, `notes`, `status`
    (`proposed|accepted|rejected`), timestamps
  - `task_invoices` table: `task_id`, `amount_cents`, `paid_at?`,
    `payment_method?`, `notes`
  - Handyman can create bids on assigned tasks and submit invoices when done
- **Realtime** — subscribe to `tasks` and `stays` so the dashboard updates
  without refresh

### Phase 2 — Property registry
- `equipment` (HVAC, septic, well pump, dock, generator, appliances) with
  install date, model, serial, manual URL (Storage)
- `maintenance_schedules` linked to equipment (interval months / hours)
- "Maintenance due" card on dashboard
- `inventory` (consumables: salt, propane, filters) with reorder thresholds
- `shopping_list` (anyone can add; owner/family can check off)
- `checklists` (open-up, close-down, pre-storm) — templated lists you can
  instantiate as a dated run
- `documents` (Storage bucket; warranties, deeds, insurance) with tags
- `vendors` (plumber, electrician, septic) — name, phone, notes

### Phase 3 — Expenses
- `expenses` table: `date`, `amount_cents`, `category`, `vendor`, `notes`,
  `receipt_url?`, `source` (`manual|csv|plaid`)
- **Important constraint:** Bank of America has no public API. MVP path is
  **CSV import** from BoA's "Download account activity" → parser →
  preview → confirm. Plaid is a later upgrade (paid). Do NOT promise live
  sync in Phase 3.
- Category tagging + monthly/yearly rollups
- Receipt upload to Supabase Storage

### Phase 4 — Integrations
- **Nest** (cameras + thermostat) via Google **Smart Device Management API**
  - **Gotcha:** Google charges a one-time **$5 Device Access registration
    fee** per developer project. Heads-up Dave before starting.
  - OAuth flow (server side), token refresh, snapshot fetch for cameras tab,
    setpoint + mode for thermostat
- **Weather** — Open-Meteo (free, no key) for the lakehouse coords; show on
  dashboard + a dedicated tab if useful

### Phase 5 — Notifications + polish
- Web Push + service worker for iOS PWA notifications
  (task assigned, stay reminder, bid received, invoice paid)
- Guest read-only role
- Real PWA icons + splash
- Rate limits, audit log on role changes, owner admin screen
  (manage members, change roles, invite by email)

---

## 6. Roles / RLS conventions

When adding a new table, default to this RLS shape:

- **Read:** authenticated users (everything is family-shared by default).
- **Insert/Update:** users edit their own rows by `user_id = auth.uid()`.
- **Owner override:** `exists (select 1 from profiles where id = auth.uid()
  and role = 'owner')` — owners can do anything.
- **Handyman scope:** for tables they touch, restrict to rows where
  `assigned_to = auth.uid()`.

Keep the role check as a SQL helper function once it's used in 3+ places.

---

## 7. Local development

```bash
cp .env.local.example .env.local   # fill in Supabase values
npm run dev                         # http://localhost:3000
```

Required env vars (same in Vercel):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only — never expose)
- `NEXT_PUBLIC_SITE_URL` (`http://localhost:3000` locally, prod URL in Vercel)

Migrations: see `supabase/README.md`. Phase 0 path is paste-into-SQL-editor;
move to `supabase db push` once you're past Phase 0.

---

## 8. Working agreements / collaboration style

- **Mobile-first.** Every screen must look right at iPhone widths first;
  desktop is secondary. Design for thumb reach (bottom nav exists for this).
- **Phased, incremental.** Don't sprawl scope. Phase 1 ships calendar +
  tasks + handyman before anything else gets built.
- **Don't over-abstract.** Three similar lines is better than a premature
  helper. Add error handling at boundaries (route handlers, server actions),
  not in internal code.
- **No comments unless the *why* is non-obvious.** Don't narrate what code
  does — names should do that.
- **Edit existing files when possible.** Don't create new files just to
  organize. The current layout is intentional.
- **Verify before claiming done.** For UI changes, actually load the page
  and check; don't just say "should work."

---

## 9. Known unknowns / decisions deferred

- **BoA expense import:** CSV parser format — BoA's CSV column layout has
  shifted before. Parse defensively and let the user map columns on first
  import.
- **Plaid:** revisit after Phase 3 ships if CSV import friction is real.
- **Nest $5 fee:** confirm with Dave before kicking off Phase 4.
- **Lakehouse coordinates** for weather — not yet stored. Add to a
  `settings` table or env var when starting Phase 4.
- **Timezone** — northern Michigan is `America/Detroit`. Use `date-fns-tz`
  consistently; store UTC in Postgres.
- **Photo / icon assets** — Dave hasn't picked the Blue Lake logo yet.

---

## 10. First moves for the next agent

If you're starting Phase 1, in this order:

1. Confirm with Dave: are we doing calendar or tasks first? (They're
   independent; calendar is easier and unblocks "who's there now" on the
   dashboard.)
2. Write the migration: `stays` table + RLS.
3. Wire `react-query` (already installed, not yet configured) — provider in
   the `(app)` layout, server-prefetch pattern for the calendar list.
4. Build `/calendar` month + list views on top of `date-fns`.
5. Update the dashboard "Who's there now" card to read live data.
6. Then move to `tasks` with the same shape.

Don't start Phase 2+ work until Phase 1 is in Dave's hands and he's used it
for at least a weekend.
