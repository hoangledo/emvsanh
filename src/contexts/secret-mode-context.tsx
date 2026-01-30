"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const SECRET_MODE_CLASS = "secret-mode";

type SecretModeContextValue = {
  secretModeActive: boolean;
  setSecretModeActive: (value: boolean) => void;
  toggleSecretMode: () => void;
};

const SecretModeContext = createContext<SecretModeContextValue | null>(null);

export function SecretModeProvider({ children }: { children: React.ReactNode }) {
  const [secretModeActive, setSecretModeActiveState] = useState(false);

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
