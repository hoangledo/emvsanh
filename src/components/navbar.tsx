"use client";

import { Logo } from "@/components/logo";
import { Menu, Moon, Sun, X } from "@/components/icons";
import Link from "next/link";
import { useScroll } from "@/components/scroll-provider";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";

const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#story", label: "Story" },
  { href: "#her-and-i", label: "Her and I" },
  { href: "#gallery", label: "Gallery" },
  { href: "#memes", label: "Memes" },
  { href: "#letter", label: "Letter" },
];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsMobile(!mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isMobile;
}

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { scrollY } = useScroll();
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [recoveryPhrase, setRecoveryPhrase] = useState("");
  const [changeError, setChangeError] = useState("");
  const [changeLoading, setChangeLoading] = useState(false);
  const [changeSuccess, setChangeSuccess] = useState(false);
  const isMobile = useIsMobile();
  const scrollPastThreshold = scrollY > 50;

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setChangeError("");
    if (newPassword !== confirmPassword) {
      setChangeError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setChangeError("New password must be at least 8 characters.");
      return;
    }
    if (recoveryPhrase.length < 8) {
      setChangeError("Recovery phrase must be at least 8 characters.");
      return;
    }
    setChangeLoading(true);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword,
        newPassword,
        recoveryPhrase,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setChangeLoading(false);
    if (res.ok) {
      setChangeSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setRecoveryPhrase("");
      setTimeout(() => {
        setChangePasswordOpen(false);
        setChangeSuccess(false);
        logout();
      }, 2000);
      return;
    }
    setChangeError(data?.error ?? "Change failed.");
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 border-b border-[var(--glass-border)] transition-all duration-300",
        scrollPastThreshold ? "glass shadow-lg" : "glass-subtle"
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="#home"
          className={cn(
            "flex items-center text-foreground hover:text-accent transition-colors duration-300",
            isMobile && "min-h-[2.5rem] items-center"
          )}
          aria-label="Em & Anh – Home"
        >
          <Logo variant={1} />
        </Link>

        <div className="hidden md:flex md:items-center md:gap-2">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/50 hover:text-accent transition-all duration-300 hover:scale-105"
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => {
              setChangePasswordOpen(true);
              setChangeError("");
              setChangeSuccess(false);
            }}
            className="ml-2 rounded-full px-3 py-2 text-sm text-foreground hover:bg-muted/50 hover:text-accent transition-colors"
          >
            Change password
          </button>
          <button
            type="button"
            onClick={logout}
            className="rounded-full px-3 py-2 text-sm text-foreground hover:bg-muted/50 hover:text-accent transition-colors"
          >
            Log out
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-full p-2 text-foreground hover:bg-muted/50 hover:text-accent transition-colors"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" size={20} />
            ) : (
              <Moon className="h-5 w-5" size={20} />
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-full p-2 text-foreground hover:bg-muted/50"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" size={20} />
            ) : (
              <Moon className="h-5 w-5" size={20} />
            )}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="rounded-lg p-2 text-foreground hover:bg-muted/50"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-6 w-6" size={24} /> : <Menu className="h-6 w-6" size={24} />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="glass border-t border-[var(--glass-border)] md:hidden">
          <div className="flex flex-col gap-1 px-4 py-3">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="rounded-lg px-4 py-3 text-foreground hover:bg-muted/50 hover:text-accent transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                setChangePasswordOpen(true);
                setChangeError("");
                setChangeSuccess(false);
              }}
              className="rounded-lg px-4 py-3 text-left text-foreground hover:bg-muted/50 hover:text-accent transition-colors"
            >
              Change password
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                logout();
              }}
              className="rounded-lg px-4 py-3 text-left text-foreground hover:bg-muted/50 hover:text-accent transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      )}

      <Modal
        open={changePasswordOpen}
        onClose={() => {
          setChangePasswordOpen(false);
          setChangeError("");
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          setRecoveryPhrase("");
        }}
        title="Change password"
      >
        {changeSuccess ? (
          <p className="text-sm text-foreground">
            Password updated. You will be logged out; log in with your new password.
          </p>
        ) : (
          <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
            <p className="text-xs text-muted-foreground">
              Save your recovery phrase somewhere safe; you will need it if you forget your password.
            </p>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              required
              className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              disabled={changeLoading}
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min 8 characters)"
              required
              minLength={8}
              className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              disabled={changeLoading}
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              minLength={8}
              className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              disabled={changeLoading}
            />
            <input
              type="password"
              value={recoveryPhrase}
              onChange={(e) => setRecoveryPhrase(e.target.value)}
              placeholder="Recovery phrase (min 8 characters)"
              required
              minLength={8}
              className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              disabled={changeLoading}
            />
            {changeError && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {changeError}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setChangePasswordOpen(false)}
                className="rounded-xl border border-border px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={changeLoading}
                className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:opacity-90 disabled:opacity-50"
              >
                {changeLoading ? "Saving…" : "Change password"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </header>
  );
}
