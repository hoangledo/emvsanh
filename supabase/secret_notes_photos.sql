-- Run this in Supabase SQL Editor (Dashboard > SQL Editor).
-- Also create a Storage bucket named "secret" (Private) in Dashboard > Storage.

-- Secret notes: text entries
create table if not exists secret_notes (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_secret_notes_created_at on secret_notes (created_at desc);

-- Secret photos: image + optional caption
create table if not exists secret_photos (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  caption text,
  created_at timestamptz not null default now()
);

create index if not exists idx_secret_photos_created_at on secret_photos (created_at desc);

-- RLS: no public access; all access via service_role in API routes
alter table secret_notes enable row level security;
alter table secret_photos enable row level security;

-- No policies for anon/authenticated; service_role bypasses RLS
-- API routes use createServerClient() with service_role key
