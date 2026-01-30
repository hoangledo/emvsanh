-- Her and I section: editable intro and intro photos (max 3 per person).
-- Run in Supabase SQL Editor. Uses same "album" bucket for storage.

create table her_and_i_profiles (
  person_slug text primary key check (person_slug in ('hoang', 'mai')),
  intro text not null default ''
);

insert into her_and_i_profiles (person_slug, intro)
values ('hoang', ''), ('mai', '')
on conflict (person_slug) do nothing;

create table her_and_i_photos (
  id uuid primary key default gen_random_uuid(),
  person_slug text not null check (person_slug in ('hoang', 'mai')),
  storage_path text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index idx_her_and_i_photos_person on her_and_i_photos (person_slug, sort_order);

alter table her_and_i_profiles enable row level security;
alter table her_and_i_photos enable row level security;

create policy "Public read her_and_i_profiles"
  on her_and_i_profiles for select using (true);

create policy "Public read her_and_i_photos"
  on her_and_i_photos for select using (true);
