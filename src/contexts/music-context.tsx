"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSongs } from "@/hooks/use-songs";
import type { Song } from "@/types/song";

// Minimal type stubs for the SoundCloud Widget API (loaded via <Script> in layout.tsx)
interface SCWidget {
  play(): void;
  pause(): void;
  load(
    url: string,
    options: {
      auto_play: boolean;
      buying: boolean;
      liking: boolean;
      download: boolean;
      sharing: boolean;
      show_artwork: boolean;
      show_comments: boolean;
      show_playcount: boolean;
      show_user: boolean;
      hide_related: boolean;
      visual: boolean;
    }
  ): void;
  bind(event: string, callback: (e?: unknown) => void): void;
  isPaused(callback: (isPaused: boolean) => void): void;
}

interface SCWidgetConstructor {
  new (iframe: HTMLIFrameElement): SCWidget;
  Events: {
    PLAY: string;
    PAUSE: string;
    FINISH: string;
    READY: string;
  };
}

declare global {
  interface Window {
    SC?: { Widget: SCWidgetConstructor };
  }
}

function buildEmbedUrl(soundcloudUrl: string, autoPlay = false): string {
  const params = new URLSearchParams({
    url: soundcloudUrl,
    auto_play: String(autoPlay),
    hide_related: "true",
    show_comments: "false",
    show_user: "false",
    show_reposts: "false",
    show_teaser: "false",
    visual: "false",
    buying: "false",
    liking: "false",
    download: "false",
    sharing: "false",
  });
  return `https://w.soundcloud.com/player/?${params.toString()}`;
}

const LOAD_OPTIONS = {
  auto_play: true,
  buying: false,
  liking: false,
  download: false,
  sharing: false,
  show_artwork: false,
  show_comments: false,
  show_playcount: false,
  show_user: false,
  hide_related: true,
  visual: false,
} as const;

type MusicContextValue = {
  songs: Song[];
  loading: boolean;
  currentSong: Song | null;
  isPlaying: boolean;
  widgetReady: boolean;
  playSong: (song: Song) => void;
  togglePlay: () => void;
  openPicker: () => void;
  closePicker: () => void;
  pickerOpen: boolean;
  refetchSongs: () => void;
};

const MusicContext = createContext<MusicContextValue | null>(null);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const { songs, loading, refetch } = useSongs();
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [widgetReady, setWidgetReady] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const widgetRef = useRef<SCWidget | null>(null);

  // Set the first song once songs have loaded
  useEffect(() => {
    if (!loading && songs.length > 0 && !currentSong) {
      setCurrentSong(songs[0]);
    }
  }, [songs, loading, currentSong]);

  // Initialize the SC Widget once the iframe is mounted and window.SC is available
  useEffect(() => {
    if (!currentSong || widgetRef.current) return;

    const tryInit = (): boolean => {
      if (!iframeRef.current || !window.SC) return false;

      const widget = new window.SC.Widget(iframeRef.current);
      widgetRef.current = widget;

      widget.bind(window.SC.Widget.Events.READY, () => {
        setWidgetReady(true);
      });
      widget.bind(window.SC.Widget.Events.PLAY, () => {
        setIsPlaying(true);
      });
      widget.bind(window.SC.Widget.Events.PAUSE, () => {
        setIsPlaying(false);
      });
      widget.bind(window.SC.Widget.Events.FINISH, () => {
        setIsPlaying(false);
      });

      return true;
    };

    if (!tryInit()) {
      const interval = setInterval(() => {
        if (tryInit()) clearInterval(interval);
      }, 200);
      return () => clearInterval(interval);
    }
  }, [currentSong]);

  const playSong = useCallback((song: Song) => {
    setCurrentSong(song);
    widgetRef.current?.load(song.soundcloud_url, LOAD_OPTIONS);
  }, []);

  const togglePlay = useCallback(() => {
    if (!widgetRef.current) return;
    widgetRef.current.isPaused((paused) => {
      if (paused) {
        widgetRef.current?.play();
      } else {
        widgetRef.current?.pause();
      }
    });
  }, []);

  const openPicker = useCallback(() => setPickerOpen(true), []);
  const closePicker = useCallback(() => setPickerOpen(false), []);

  return (
    <MusicContext.Provider
      value={{
        songs,
        loading,
        currentSong,
        isPlaying,
        widgetReady,
        playSong,
        togglePlay,
        openPicker,
        closePicker,
        pickerOpen,
        refetchSongs: refetch,
      }}
    >
      {/* Hidden SoundCloud iframe — only rendered when we have a song to play.
          visibility:hidden keeps it in the layout tree (required for SC Widget API to work)
          but invisible to the user. auto_play=true in the embed URL attempts autoplay. */}
      {currentSong && (
        <iframe
          ref={iframeRef}
          id="sc-widget"
          allow="autoplay"
          src={buildEmbedUrl(currentSong.soundcloud_url, true)}
          style={{
            width: 0,
            height: 0,
            border: "none",
            position: "absolute",
            visibility: "hidden",
          }}
          aria-hidden="true"
          tabIndex={-1}
        />
      )}
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusic must be used within MusicProvider");
  return ctx;
}
