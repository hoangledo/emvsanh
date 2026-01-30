"use client";

import { useCallback, useEffect, useState } from "react";

export type SecretPhoto = {
  id: string;
  storage_path: string;
  caption: string | null;
  created_at: string;
  url: string | null;
};

export function useSecretPhotos() {
  const [photos, setPhotos] = useState<SecretPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/secret/photos");
      if (res.ok) {
        const data = await res.json();
        setPhotos(Array.isArray(data) ? data : []);
      } else {
        setPhotos([]);
      }
    } catch {
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { photos, loading, refetch };
}
