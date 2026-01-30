"use client";

import { useCallback, useEffect, useState } from "react";
import type { AlbumSection } from "@/types/album";

export type AlbumImageItem = {
  id: string;
  section: string;
  storage_path: string;
  alt: string;
  note: string | null;
  sort_order: number;
  created_at: string;
  url: string;
};

export function useAlbumImages(section: AlbumSection) {
  const [items, setItems] = useState<AlbumImageItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/album/images?section=${section}`);
      if (res.ok) {
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [section]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { items, loading, refetch };
}
