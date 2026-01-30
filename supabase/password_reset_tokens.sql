-- Password reset tokens (for email reset link). API uses service_role only.
-- Run in Supabase SQL Editor.

create table password_reset_tokens (
  token_hash text primary key,
  email text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index idx_password_reset_tokens_expires on password_reset_tokens (expires_at);

alter table password_reset_tokens enable row level security;

-- No policies; service_role only
