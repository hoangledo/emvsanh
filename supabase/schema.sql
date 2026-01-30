-- Run this in Supabase SQL Editor (Dashboard > SQL Editor).
-- Also create a Storage bucket named "album" (Public) in Dashboard > Storage.

-- Section id matches app: young, mai, hoang, foods, memes, gallery
create type album_section as enum (
  'young', 'mai', 'hoang', 'foods', 'memes', 'gallery'
);

create table album_images (
  id uuid primary key default gen_random_uuid(),
  section album_section not null,
  storage_path text not null,
  alt text not null default '',
  note text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index idx_album_images_section_order on album_images (section, sort_order);

create table moments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date text not null,
  description text not null,
  storage_path text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index idx_moments_order on moments (sort_order);

-- RLS: public read; writes only via service_role (API routes)
alter table album_images enable row level security;
alter table moments enable row level security;

create policy "Public read album_images"
  on album_images for select using (true);

create policy "Public read moments"
  on moments for select using (true);
