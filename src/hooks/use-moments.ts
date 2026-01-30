"use client";

import { useCallback, useEffect, useState } from "react";

export type MomentItem = {
  id: string;
  title: string;
  date: string;
  description: string;
  storage_path: string;
  sort_order: number;
  created_at: string;
  url: string;
};

export function useMoments() {
  const [items, setItems] = useState<MomentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/album/moments");
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
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { items, loading, refetch };
}
