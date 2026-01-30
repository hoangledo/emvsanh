"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Heart } from "@/components/icons";

export function LoginPage() {
  const { login } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const ok = await login(password);
    setLoading(false);
    if (!ok) setError("Wrong password. Try again.");
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
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-accent px-4 py-3 font-medium text-accent-foreground transition-colors hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Checking…" : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
