"use client";

import { useMusic } from "@/contexts/music-context";
import { cn } from "@/lib/utils";

function MusicNoteIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
    >
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  );
}

export function MusicPlayer() {
  const { songs, loading, currentSong, isPlaying, widgetReady, togglePlay, openPicker } =
    useMusic();

  // Hide while songs are still loading to avoid flash
  if (loading) return null;

  const isEmpty = songs.length === 0;
  const isDisabled = !widgetReady || !currentSong;

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-40",
        "glass rounded-2xl shadow-xl",
        "flex items-center gap-3 px-4 py-3",
        "min-w-[200px] max-w-[270px]",
        "animate-[fadeInUp_0.4s_ease-out]"
      )}
      role="region"
      aria-label="Music player"
    >
      {/* Song info — clicking opens the picker */}
      <button
        type="button"
        onClick={openPicker}
        className="flex items-center gap-2 flex-1 min-w-0 text-left group"
        aria-label={isEmpty ? "Add music" : "Change song"}
      >
        <span className="shrink-0 text-primary">
          <MusicNoteIcon
            className={cn(
              "transition-transform duration-300",
              isPlaying && "animate-spin [animation-duration:3s]"
            )}
          />
        </span>
        <div className="flex flex-col min-w-0">
          <span className="text-foreground text-sm font-medium truncate leading-tight group-hover:text-primary transition-colors duration-200">
            {isEmpty ? "Add music" : (currentSong?.name ?? "Choose a song")}
          </span>
          {!isEmpty && currentSong?.artist && (
            <span className="text-muted-foreground text-xs truncate leading-tight">
              {currentSong.artist}
            </span>
          )}
        </div>
      </button>

      {/* Play / Pause — hidden when no songs */}
      {!isEmpty && (
        <button
          type="button"
          onClick={togglePlay}
          disabled={isDisabled}
          className={cn(
            "shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
            "bg-primary text-primary-foreground",
            "hover:opacity-90 transition-opacity duration-200",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            "shadow-md"
          )}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
      )}
    </div>
  );
}
