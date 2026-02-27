"use client";

import { useCallback, useEffect, useState } from "react";
import type { Song } from "@/types/song";

export function useSongs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/songs");
      if (res.ok) {
        const data = await res.json();
        setSongs(Array.isArray(data) ? data : []);
      } else {
        setSongs([]);
      }
    } catch {
      setSongs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { songs, loading, refetch };
}
