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
  secretModeActive: boolean;
  setSecretModeActive: (value: boolean) => void;
  toggleSecretMode: () => void;
};

const SecretModeContext = createContext<SecretModeContextValue | null>(null);

export function SecretModeProvider({ children }: { children: React.ReactNode }) {
  const [secretModeActive, setSecretModeActiveState] = useState(false);
  const isMobile = useIsMobile();
  const touchStartY = useRef(0);
  const didTriggerFromTouch = useRef(false);

  const setSecretModeActive = useCallback((value: boolean) => {
    setSecretModeActiveState(value);
    if (typeof document !== "undefined") {
      if (value) {
        document.documentElement.classList.add(SECRET_MODE_CLASS);
      } else {
        document.documentElement.classList.remove(SECRET_MODE_CLASS);
      }
    }
  }, []);

  const toggleSecretMode = useCallback(() => {
    setSecretModeActiveState((prev) => {
      const next = !prev;
      if (typeof document !== "undefined") {
        if (next) {
          document.documentElement.classList.add(SECRET_MODE_CLASS);
        } else {
          document.documentElement.classList.remove(SECRET_MODE_CLASS);
        }
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        toggleSecretMode();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSecretMode]);

  useEffect(() => {
    if (!isMobile || secretModeActive) return;

    const handleWheel = (e: WheelEvent) => {
      if (!isWindowAtBottom()) return;
      if (e.deltaY <= MIN_WHEEL_DELTA) return;
      e.preventDefault();
      toggleSecretMode();
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
        toggleSecretMode();
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
  }, [isMobile, secretModeActive, toggleSecretMode]);

  const value: SecretModeContextValue = {
    secretModeActive,
    setSecretModeActive,
    toggleSecretMode,
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
