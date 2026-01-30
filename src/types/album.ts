export const ALBUM_SECTIONS = [
  "young",
  "mai",
  "hoang",
  "foods",
  "memes",
  "gallery",
] as const;

export type AlbumSection = (typeof ALBUM_SECTIONS)[number];

export type AlbumImageRow = {
  id: string;
  section: AlbumSection;
  storage_path: string;
  alt: string;
  note: string | null;
  sort_order: number;
  created_at: string;
};

export type AlbumImageWithUrl = AlbumImageRow & { url: string };

export type MomentRow = {
  id: string;
  title: string;
  date: string;
  description: string;
  storage_path: string;
  sort_order: number;
  created_at: string;
};

export type MomentWithUrl = MomentRow & { url: string };
