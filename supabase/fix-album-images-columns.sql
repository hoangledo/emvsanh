-- Run this in Supabase SQL Editor if POST /api/album/images returns 500
-- (e.g. after dropping a column from album_images).
-- This adds back any missing columns the app expects.

-- 1. Ensure the enum type exists (skip if it already exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'album_section') THEN
    CREATE TYPE album_section AS ENUM (
      'young', 'mai', 'hoang', 'foods', 'memes', 'gallery'
    );
  END IF;
END
$$;

-- 2. Add missing columns to album_images (no-op if column already exists)
ALTER TABLE album_images ADD COLUMN IF NOT EXISTS section album_section;
ALTER TABLE album_images ADD COLUMN IF NOT EXISTS storage_path text;
ALTER TABLE album_images ADD COLUMN IF NOT EXISTS alt text NOT NULL DEFAULT '';
ALTER TABLE album_images ADD COLUMN IF NOT EXISTS note text;
ALTER TABLE album_images ADD COLUMN IF NOT EXISTS sort_order int NOT NULL DEFAULT 0;
ALTER TABLE album_images ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- 3. If section was added back and is null, you may need to backfill or leave as-is for new rows only.
