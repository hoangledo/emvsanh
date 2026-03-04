"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/components/theme-provider";
import { Heart } from "@/components/icons";
import { Modal } from "@/components/ui/modal";

const COLOR_THEMES = [
  { id: "light" as const, color: "#ff4d6d", label: "Pink" },
  { id: "dark" as const, color: "#800f2f", label: "Red" },
  { id: "lavender" as const, color: "#7c3aed", label: "Lavender" },
  { id: "peach" as const, color: "#ea580c", label: "Peach" },
];

export function LoginPage() {
  const { login } = useAuth();
  const { theme, setTheme } = useTheme();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const ok = await login(password);
    setLoading(false);
    if (!ok) setError("Wrong password. Try again.");
  }

  async function handleForgotSubmit(e: React.FormEvent) {
    e.preventDefault();
    setForgotError("");
    setForgotLoading(true);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: forgotEmail.trim().toLowerCase() }),
    });
    const data = await res.json().catch(() => ({}));
    setForgotLoading(false);
    if (res.ok) {
      setForgotSuccess(true);
      setForgotEmail("");
      setTimeout(() => {
        setForgotOpen(false);
        setForgotSuccess(false);
      }, 3000);
      return;
    }
    setForgotError(data?.error ?? "Request failed.");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-24">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute left-1/3 top-1/4 h-80 w-80 rounded-full blur-3xl bg-accent/40" />
      </div>

      <div className="glass relative z-10 w-full max-w-sm rounded-2xl border border-border p-8 shadow-xl">
        <Heart
          className="mx-auto mb-6 h-14 w-14 text-accent"
          size={56}
          fill="currentColor"
        />
        <h1 className="text-center font-serif text-2xl text-foreground">
          Em & Anh
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Enter the password to view our album
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            autoFocus
            disabled={loading}
            autoComplete="current-password"
          />
          {error && (
            <p className="text-center text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <div className="flex items-center justify-center gap-3 py-1">
            {COLOR_THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                title={t.label}
                aria-label={`${t.label} theme`}
                className="relative h-6 w-6 rounded-full transition-transform hover:scale-110 focus:outline-none"
                style={{ backgroundColor: t.color }}
              >
                {theme === t.id && (
                  <span className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-white ring-offset-2" style={{ ringOffsetColor: t.color }} />
                )}
              </button>
            ))}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-accent px-4 py-3 font-medium text-accent-foreground transition-colors hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Checking…" : "Enter"}
          </button>
          <p className="text-center">
            <button
              type="button"
              onClick={() => {
                setForgotOpen(true);
                setForgotError("");
                setForgotSuccess(false);
              }}
              className="text-sm text-muted-foreground underline hover:text-accent"
            >
              Forgot password?
            </button>
          </p>
        </form>
      </div>

      <Modal
        open={forgotOpen}
        onClose={() => {
          setForgotOpen(false);
          setForgotError("");
          setForgotEmail("");
        }}
        title="Reset password"
      >
        {forgotSuccess ? (
          <p className="text-center text-sm text-foreground">
            If that email is registered, we sent a reset link. Check your inbox
            and use the link to set a new password. The link expires in 1 hour.
          </p>
        ) : (
          <form onSubmit={handleForgotSubmit} className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Enter your email address. We will send a reset link only to the
              registered email.
            </p>
            <input
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="Your email"
              required
              className="rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              disabled={forgotLoading}
            />
            {forgotError && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {forgotError}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setForgotOpen(false)}
                className="rounded-xl border border-border px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={forgotLoading}
                className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:opacity-90 disabled:opacity-50"
              >
                {forgotLoading ? "Sending…" : "Send reset link"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
