"use client";

import { useCallback, useEffect, useState } from "react";

export type HerAndIPersonSlug = "hoang" | "mai";

export type HerAndIPhoto = {
  id: string;
  url: string;
  sort_order: number;
};

export type HerAndIPersonData = {
  intro: string;
  photos: HerAndIPhoto[];
};

export type HerAndIApiData = {
  hoang: HerAndIPersonData;
  mai: HerAndIPersonData;
};

export function useHerAndI() {
  const [data, setData] = useState<HerAndIApiData | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/her-and-i");
      const json = (await res.json()) as HerAndIApiData;
      setData(json);
    } catch {
      setData({
        hoang: { intro: "", photos: [] },
        mai: { intro: "", photos: [] },
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, refetch };
}
