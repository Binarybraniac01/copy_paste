# BridgePad

BridgePad is a small, temporary plain-text shared note. One deployment serves **two hostnames**—a Normal URL and an Isolation URL—so the same session can be opened in both browser contexts. BridgePad does not detect, control, or configure browser isolation; routing the Isolation URL is your organization's policy responsibility.

## Local development

```bash
npm install
cp .env.example .env.local
# fill in .env.local
npm run dev
```

Then open `http://localhost:3000`. `NEXT_PUBLIC_NORMAL_ORIGIN` and `NEXT_PUBLIC_ISOLATED_ORIGIN` may both be localhost in development.

## Supabase setup

1. Create a Supabase project.
2. Install the Supabase CLI and authenticate, then link the project and run `supabase db push` (or run `supabase/migrations/20260905000000_create_pads.sql` in SQL Editor).
3. In **Database → Replication**, enable the `pads` table for Realtime (the migration adds it to `supabase_realtime`).
4. Copy the project URL and anon key into the `NEXT_PUBLIC_` variables. Put the **service role key only** in `SUPABASE_SERVICE_ROLE_KEY`; it is used exclusively by server route handlers and is never sent to browsers.
5. Enable the `pg_cron` extension in Dashboard → Database → Extensions and run the final, commented `cron.schedule` statement from the migration to remove expired pads every 15 minutes.

The migration enables RLS. Anonymous browser access is limited to non-expired rows for Supabase Realtime; unguessable 72-bit session IDs act as the possession capability. Reads and writes for the application API are performed server-side, validate session IDs and expiry, and use the service role. Do not expose the service role key.

## Configuration

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe Supabase connection for Realtime. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only database access. |
| `NEXT_PUBLIC_NORMAL_ORIGIN` | Full normal hostname origin. |
| `NEXT_PUBLIC_ISOLATED_ORIGIN` | Full isolation hostname origin. |
| `PAD_TTL_MINUTES` | Pad lifetime; defaults to 60. |
| `MAX_PAD_SIZE_BYTES` | Plain-text limit; defaults to 1048576. The SQL migration currently enforces 1 MB too. |

## Two-domain deployment on Vercel

Deploy this repository once to Vercel, set every environment variable above, and attach both desired domains to that **same** Vercel project. Set `NEXT_PUBLIC_NORMAL_ORIGIN` and `NEXT_PUBLIC_ISOLATED_ORIGIN` to their respective HTTPS origins. A session at `/p/<id>` uses the same Supabase row from either host. Configure your organization's separate browser-isolation policy to handle the isolation hostname; BridgePad makes no claim about whether a new tab is isolated.

## Sync behavior and limitations

The textarea saves after a 400 ms debounce. Supabase Postgres Changes distributes database updates to other open views. A subscription is established and the pad is reloaded to close the startup race. The local editor ignores remote changes matching its current state and never overwrites unsaved local typing. If a remote change arrives while local text is dirty, the local debounced save wins deterministically: this is intentional **last-write-wins** behavior, not CRDT collaboration. Failed saves retain local text and show an actionable status.

## Checks

```bash
npm run lint
npm test
npm run build
```
