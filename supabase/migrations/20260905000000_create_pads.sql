-- BridgePad's temporary shared-note store. Run with `supabase db push`.
create table public.pads (
  id uuid primary key default gen_random_uuid(),
  session_id text unique not null check (session_id ~ '^[A-Za-z0-9_-]{12,16}$'),
  content text not null default '' check (octet_length(content) <= 1048576),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index pads_session_id_idx on public.pads (session_id);
create index pads_expires_at_idx on public.pads (expires_at);
create or replace function public.set_pads_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
create trigger pads_updated_at before update on public.pads for each row execute function public.set_pads_updated_at();
alter table public.pads enable row level security;
-- The app's browser client requires SELECT solely to receive Realtime updates.
-- Session IDs have 72 bits of cryptographic entropy; API writes/reads use the service role and validate expiry.
create policy "anonymous realtime reads by unguessable session" on public.pads for select to anon using (expires_at > now());
alter publication supabase_realtime add table public.pads;
create or replace function public.cleanup_expired_pads() returns void language sql security definer set search_path = public as $$ delete from public.pads where expires_at <= now(); $$;
-- In Supabase Dashboard enable pg_cron, then schedule this once (or run in a migration where pg_cron is enabled):
-- select cron.schedule('bridgepad-expired-pad-cleanup', '*/15 * * * *', $$select public.cleanup_expired_pads()$$);
