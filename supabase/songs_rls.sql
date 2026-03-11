-- Enable RLS on songs table and add public read policy.
-- All writes go through API routes that use the service_role key (bypasses RLS).
-- Run in Supabase SQL Editor.

alter table songs enable row level security;

create policy "Public read songs"
  on songs for select using (true);
