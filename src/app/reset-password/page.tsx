"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Heart } from "@/components/icons";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!token) {
      setError("Missing reset link. Use the link from your email.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => router.push("/?login"), 2000);
      return;
    }
    setError(data?.error ?? "Reset failed.");
  }

  if (!token) {
    return (
      <div className="glass relative z-10 w-full max-w-sm rounded-2xl border border-border p-8 shadow-xl">
        <Heart
          className="mx-auto mb-6 h-14 w-14 text-accent"
          size={56}
          fill="currentColor"
        />
        <h1 className="text-center font-serif text-2xl text-foreground">
          Invalid reset link
        </h1>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Use the link from your email, or request a new one from the login page.
        </p>
        <Link
          href="/"
          className="mt-6 block w-full rounded-xl bg-accent px-4 py-3 text-center font-medium text-accent-foreground transition-colors hover:opacity-90"
        >
          Back to login
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="glass relative z-10 w-full max-w-sm rounded-2xl border border-border p-8 shadow-xl">
        <Heart
          className="mx-auto mb-6 h-14 w-14 text-accent"
          size={56}
          fill="currentColor"
        />
        <h1 className="text-center font-serif text-2xl text-foreground">
          Password reset
        </h1>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Your password has been updated. Redirecting to login…
        </p>
      </div>
    );
  }

  return (
    <div className="glass relative z-10 w-full max-w-sm rounded-2xl border border-border p-8 shadow-xl">
      <Heart
        className="mx-auto mb-6 h-14 w-14 text-accent"
        size={56}
        fill="currentColor"
      />
      <h1 className="text-center font-serif text-2xl text-foreground">
        Set new password
      </h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Enter your new password below.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New password (min 8 characters)"
          required
          minLength={8}
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          disabled={loading}
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          required
          minLength={8}
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          disabled={loading}
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
          {loading ? "Saving…" : "Set password"}
        </button>
      </form>
      <p className="mt-6 text-center">
        <Link
          href="/"
          className="text-sm text-muted-foreground underline hover:text-accent"
        >
          Back to login
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-24">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute left-1/3 top-1/4 h-80 w-80 rounded-full blur-3xl bg-accent/40" />
      </div>
      <Suspense
        fallback={
          <div className="glass relative z-10 w-full max-w-sm rounded-2xl border border-border p-8 shadow-xl">
            <p className="text-center text-muted-foreground">Loading…</p>
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
