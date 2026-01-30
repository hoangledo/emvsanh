"use client";

import { useMemo } from "react";
import type { SecretNote } from "./use-secret-notes";
import type { SecretPhoto } from "./use-secret-photos";

export type SecretFeedItem =
  | { type: "note"; id: string; createdAt: string; note: SecretNote }
  | { type: "photo"; id: string; createdAt: string; photo: SecretPhoto };

export function useSecretFeed(
  notes: SecretNote[],
  photos: SecretPhoto[]
): SecretFeedItem[] {
  return useMemo(() => {
    const items: SecretFeedItem[] = [
      ...notes.map((note) => ({
        type: "note" as const,
        id: `note-${note.id}`,
        createdAt: note.created_at,
        note,
      })),
      ...photos.map((photo) => ({
        type: "photo" as const,
        id: `photo-${photo.id}`,
        createdAt: photo.created_at,
        photo,
      })),
    ];
    items.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return items;
  }, [notes, photos]);
}
