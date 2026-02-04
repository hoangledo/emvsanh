"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const SECRET_MODE_CLASS = "secret-mode";
const BOTTOM_THRESHOLD_PX = 40;
const SCROLL_UP_GESTURE_PX = 100;
const MIN_WHEEL_DELTA = 80;

type SecretMode = "notes" | "valentine" | null;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isMobile;
}

function isWindowAtBottom() {
  if (typeof window === "undefined") return false;
  const { scrollY, innerHeight } = window;
  const scrollHeight = document.documentElement.scrollHeight;
  return scrollY + innerHeight >= scrollHeight - BOTTOM_THRESHOLD_PX;
}

type SecretModeContextValue = {
  /**
   * Whether any secret mode is currently active.
   */
  secretModeActive: boolean;
  /**
   * Which secret mode is active. `null` means no secret mode.
   */
  mode: SecretMode;
  /**
   * Legacy-style setter to turn secret mode on/off.
   * When turning on from `null`, this will open the notes mode.
   */
  setSecretModeActive: (value: boolean) => void;
  /**
   * Toggle the notes-based secret mode on/off.
   */
  toggleSecretMode: () => void;
  /**
   * Explicitly open the notes/photos secret mode.
   */
  openNotesMode: () => void;
  /**
   * Explicitly open the Valentine confession secret mode.
   */
  openValentineMode: () => void;
  /**
   * Close any active secret mode.
   */
  closeSecretMode: () => void;
};

const SecretModeContext = createContext<SecretModeContextValue | null>(null);

export function SecretModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<SecretMode>(null);
  const secretModeActive = mode !== null;
  const isMobile = useIsMobile();
  const touchStartY = useRef(0);
  const didTriggerFromTouch = useRef(false);

  const setSecretModeActive = useCallback((value: boolean) => {
    setMode((current) => {
      const next: SecretMode = value ? current ?? "notes" : null;
      return next;
    });
    if (typeof document !== "undefined") {
      if (value) {
        document.documentElement.classList.add(SECRET_MODE_CLASS);
      } else {
        document.documentElement.classList.remove(SECRET_MODE_CLASS);
      }
    }
  }, []);

  const toggleSecretMode = useCallback(() => {
    setMode((current) => {
      const next: SecretMode = current === null ? "notes" : null;
      if (typeof document !== "undefined") {
        if (next !== null) {
          document.documentElement.classList.add(SECRET_MODE_CLASS);
        } else {
          document.documentElement.classList.remove(SECRET_MODE_CLASS);
        }
      }
      return next;
    });
  }, []);

  const openNotesMode = useCallback(() => {
    setMode((current) => {
      if (current === "notes") return current;
      if (typeof document !== "undefined") {
        document.documentElement.classList.add(SECRET_MODE_CLASS);
      }
      return "notes";
    });
  }, []);

  const openValentineMode = useCallback(() => {
    setMode((current) => {
      if (current === "valentine") return current;
      if (typeof document !== "undefined") {
        document.documentElement.classList.add(SECRET_MODE_CLASS);
      }
      return "valentine";
    });
  }, []);

  const closeSecretMode = useCallback(() => {
    setMode(() => {
      if (typeof document !== "undefined") {
        document.documentElement.classList.remove(SECRET_MODE_CLASS);
      }
      return null;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        toggleSecretMode();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === "u" || e.key === "U")) {
        e.preventDefault();
        openValentineMode();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSecretMode, openValentineMode]);

  useEffect(() => {
    if (!isMobile || mode !== null) return;

    const handleWheel = (e: WheelEvent) => {
      if (!isWindowAtBottom()) return;
      if (e.deltaY <= MIN_WHEEL_DELTA) return;
      e.preventDefault();
      openNotesMode();
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      didTriggerFromTouch.current = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (didTriggerFromTouch.current) return;
      if (!isWindowAtBottom()) return;
      const currentY = e.touches[0].clientY;
      const movedUp = touchStartY.current - currentY;
      if (movedUp >= SCROLL_UP_GESTURE_PX) {
        didTriggerFromTouch.current = true;
        openNotesMode();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [isMobile, mode, openNotesMode]);

  const value: SecretModeContextValue = {
    secretModeActive,
    mode,
    setSecretModeActive,
    toggleSecretMode,
    openNotesMode,
    openValentineMode,
    closeSecretMode,
  };

  return (
    <SecretModeContext.Provider value={value}>
      {children}
    </SecretModeContext.Provider>
  );
}

export function useSecretMode() {
  const ctx = useContext(SecretModeContext);
  if (!ctx) throw new Error("useSecretMode must be used within SecretModeProvider");
  return ctx;
}
