# Blue Lake

Mobile-first iOS PWA for managing the family lakehouse — calendar, tasks,
handyman work, expenses, weather, and Nest devices.

## Stack

- **Next.js 16** (App Router, Turbopack, React 19.2)
- **TypeScript** + **Tailwind CSS v4** + **shadcn/ui** (base-ui preset)
- **Supabase** — Postgres, Auth (magic link), Storage, Realtime, Edge Functions
- **Vercel** — hosting + preview deploys
- **Web Push** + service worker for iOS PWA notifications (later phase)

## Local development

```bash
cp .env.local.example .env.local   # fill in Supabase values
npm run dev
```

Then visit http://localhost:3000.

## Required environment variables

| Name | Where | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | from Supabase dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server | from Supabase dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | never expose to client |
| `NEXT_PUBLIC_SITE_URL` | client + server | used for magic-link redirects |

Set the same four variables in Vercel (Project → Settings → Environment Variables)
for Production, Preview, and Development.

## Project layout

```
src/
  app/
    (app)/           protected app shell — header, bottom nav, dashboard
    auth/            callback, error, sign-out routes
    login/           magic-link sign-in
    layout.tsx       root layout — metadata, viewport, theme
    manifest.ts      PWA manifest
  components/        UI primitives + app chrome
  lib/
    supabase/        server, client, proxy session refresh
    utils.ts         cn helper
  proxy.ts           Next.js 16 proxy (replaces middleware.ts)
public/              static assets — icon TODO
supabase/            migrations and seed (added in Phase 1)
```

## Roles (Phase 1+)

- `owner` — full access
- `family` — everything except billing & integration secrets
- `handyman` — only their assigned tasks + invoice entry
- `guest` *(later)* — read-only stays/calendar

## Phase plan

See conversation notes / project memory. Phase 0 ships auth + nav shell.
Phase 1 ships calendar + tasks + handyman flow. Phase 4 adds Nest + weather.

## Notes

- Next.js 16 uses `proxy.ts` instead of `middleware.ts`. The proxy refreshes
  the Supabase session cookie on every request.
- `cookies()`, `headers()`, `params`, and `searchParams` are all async in v16.
- PWA icons live in `/public` — see `public/ICONS.todo`.
