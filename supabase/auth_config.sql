-- Single-user auth: password and recovery phrase (hashed). API uses service role only.
-- Run in Supabase SQL Editor.

create table auth_config (
  id text primary key default 'single',
  password_hash text,
  recovery_phrase_hash text,
  updated_at timestamptz not null default now()
);

-- No public read; API routes use service_role to read/write
alter table auth_config enable row level security;

-- No policies: anon and authenticated have no access; service_role bypasses RLS
