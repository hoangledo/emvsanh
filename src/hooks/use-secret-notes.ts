"use client";

import { useCallback, useEffect, useState } from "react";

export type SecretNote = {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export function useSecretNotes() {
  const [notes, setNotes] = useState<SecretNote[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/secret/notes");
      if (res.ok) {
        const data = await res.json();
        setNotes(Array.isArray(data) ? data : []);
      } else {
        setNotes([]);
      }
    } catch {
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { notes, loading, refetch };
}
