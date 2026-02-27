"use client";

import { useState, useCallback } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useMusic } from "@/contexts/music-context";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { Plus, Trash2 } from "@/components/icons";
import type { Song } from "@/types/song";

function EqualizerBars() {
  return (
    <div className="flex gap-[2px] items-end h-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="w-[3px] rounded-full bg-primary"
          style={{
            height: "100%",
            transformOrigin: "bottom",
            animation: `equalizerBar${i} 0.8s ease-in-out infinite alternate`,
            animationDelay: `${(i - 1) * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
}

function SongItem({
  song,
  isActive,
  isPlaying,
  onSelect,
  onDelete,
  isAdmin,
}: {
  song: Song;
  isActive: boolean;
  isPlaying: boolean;
  onSelect: () => void;
  onDelete: () => void;
  isAdmin: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all cursor-pointer select-none",
        isActive
          ? "bg-primary/10 border border-primary/25"
          : "hover:bg-muted/40 border border-transparent"
      )}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      aria-pressed={isActive}
    >
      {/* Playing indicator */}
      <div className="shrink-0 w-6 h-6 flex items-center justify-center">
        {isActive && isPlaying ? (
          <EqualizerBars />
        ) : (
          <div
            className={cn(
              "w-2 h-2 rounded-full",
              isActive ? "bg-primary" : "bg-muted-foreground/30"
            )}
          />
        )}
      </div>

      {/* Song info */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium truncate leading-tight",
            isActive ? "text-primary" : "text-foreground"
          )}
        >
          {song.name}
        </p>
        <p className="text-xs text-muted-foreground truncate leading-tight">{song.artist}</p>
      </div>

      {/* Admin delete */}
      {isAdmin && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="shrink-0 p-1.5 rounded-full text-muted-foreground hover:text-red-500 hover:bg-muted/50 transition-colors"
          aria-label={`Remove ${song.name}`}
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
}

function AddSongForm({ onAdded }: { onAdded: () => void }) {
  const [name, setName] = useState("");
  const [artist, setArtist] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !artist.trim() || !url.trim()) {
      setError("All fields are required.");
      return;
    }
    if (!url.trim().startsWith("https://soundcloud.com")) {
      setError("Please enter a valid SoundCloud URL.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          artist: artist.trim(),
          soundcloud_url: url.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data?.error ?? "Failed to add song.");
        return;
      }
      setName("");
      setArtist("");
      setUrl("");
      onAdded();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all";

  return (
    <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-border space-y-2.5">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Add a song
      </p>
      <input
        className={inputClass}
        placeholder="Song name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={submitting}
      />
      <input
        className={inputClass}
        placeholder="Artist"
        value={artist}
        onChange={(e) => setArtist(e.target.value)}
        disabled={submitting}
      />
      <input
        className={inputClass}
        placeholder="https://soundcloud.com/artist/track"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={submitting}
        type="url"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <Button type="submit" size="sm" disabled={submitting} className="w-full">
        <Plus size={14} className="mr-1.5" />
        {submitting ? "Adding…" : "Add Song"}
      </Button>
    </form>
  );
}

export function MusicPicker() {
  const { songs, loading, currentSong, isPlaying, playSong, pickerOpen, closePicker, refetchSongs } =
    useMusic();
  const { isAuthenticated: isAdmin } = useAuth();

  const handleDelete = useCallback(
    async (song: Song) => {
      if (!confirm(`Remove "${song.name}" from the playlist?`)) return;
      try {
        await fetch(`/api/songs/${song.id}`, { method: "DELETE" });
        refetchSongs();
      } catch {
        // silent — user can retry
      }
    },
    [refetchSongs]
  );

  return (
    <Modal open={pickerOpen} onClose={closePicker} title="Our playlist 🎵">
      <div className="max-h-[50vh] overflow-y-auto space-y-1 pr-1 -mr-1">
        {loading && (
          <p className="text-center text-sm text-muted-foreground py-6">Loading songs…</p>
        )}
        {!loading && songs.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-6">
            No songs yet.{isAdmin ? " Add one below!" : ""}
          </p>
        )}
        {songs.map((song) => (
          <SongItem
            key={song.id}
            song={song}
            isActive={currentSong?.id === song.id}
            isPlaying={isPlaying}
            onSelect={() => {
              playSong(song);
              closePicker();
            }}
            onDelete={() => handleDelete(song)}
            isAdmin={isAdmin}
          />
        ))}
      </div>

      {isAdmin && <AddSongForm onAdded={refetchSongs} />}
    </Modal>
  );
}
