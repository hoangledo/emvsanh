"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const SESSION_KEY = "album_session";
const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

type Session = { expiresAt: number };

function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Session;
    if (Date.now() >= session.expiresAt) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function setSession() {
  const session: Session = {
    expiresAt: Date.now() + SESSION_DURATION_MS,
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

type AuthContextValue = {
  isAuthenticated: boolean;
  isReady: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthState = { isReady: boolean; isAuthenticated: boolean };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isReady: false,
    isAuthenticated: false,
  });
  const { isReady, isAuthenticated } = state;

  useEffect(() => {
    let ready: boolean;
    let authenticated: boolean;
    if (typeof window === "undefined") return;
    if (window.location.search === "?login") {
      clearSession();
      window.history.replaceState({}, "", window.location.pathname);
      ready = true;
      authenticated = false;
    } else {
      const session = getSession();
      ready = true;
      authenticated = !!session;
    }
    const id = requestAnimationFrame(() => {
      setState((prev) =>
        prev.isReady === ready && prev.isAuthenticated === authenticated
          ? prev
          : { isReady: ready, isAuthenticated: authenticated }
      );
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const login = useCallback(async (password: string): Promise<boolean> => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) return false;
    setSession();
    setState((prev) => (prev.isAuthenticated ? prev : { ...prev, isAuthenticated: true }));
    return true;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setState((prev) => (prev.isAuthenticated ? { ...prev, isAuthenticated: false } : prev));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ isAuthenticated, isReady, login, logout }),
    [isAuthenticated, isReady, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
