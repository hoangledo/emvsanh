"use client";

import { Logo } from "@/components/logo";
import { Menu, Moon, Settings, Sun, X } from "@/components/icons";
import Link from "next/link";
import { useScroll } from "@/components/scroll-provider";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { Modal } from "@/components/ui/modal";

const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#story", label: "Story" },
  { href: "#her-and-i", label: "Us" },
  { href: "#young", label: "Young" },
  { href: "#mai", label: "Her" },
  { href: "#hoang", label: "Together" },
  { href: "#foods", label: "Foods" },
  { href: "#memes", label: "Fun" },
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
  const { isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsDesktopRef = useRef<HTMLDivElement>(null);
  const settingsMobileRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (!settingsOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const inDesktop = settingsDesktopRef.current?.contains(target);
      const inMobile = settingsMobileRef.current?.contains(target);
      if (!inDesktop && !inMobile) setSettingsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [settingsOpen]);

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
          <div className="relative ml-2" ref={settingsDesktopRef}>
            <button
              type="button"
              onClick={() => setSettingsOpen((o) => !o)}
              className="rounded-full p-2 text-foreground hover:bg-muted/50 hover:text-accent transition-colors"
              aria-label="Settings"
              aria-expanded={settingsOpen}
            >
              <Settings className="h-5 w-5" size={20} />
            </button>
            {settingsOpen && (
              <div
                className="absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] py-1 shadow-lg backdrop-blur-md"
                role="menu"
              >
                <button
                  type="button"
                  onClick={() => {
                    toggleTheme();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-muted/50 hover:text-accent"
                  role="menuitem"
                >
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4" size={16} />
                  ) : (
                    <Moon className="h-4 w-4" size={16} />
                  )}
                  <span>Color mode</span>
                </button>
                {isAuthenticated && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setSettingsOpen(false);
                        setChangePasswordOpen(true);
                        setChangeError("");
                        setChangeSuccess(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-muted/50 hover:text-accent"
                      role="menuitem"
                    >
                      Change password
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSettingsOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-muted/50 hover:text-accent"
                      role="menuitem"
                    >
                      Log out
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <div className="relative" ref={settingsMobileRef}>
            <button
              type="button"
              onClick={() => setSettingsOpen((o) => !o)}
              className="rounded-full p-2 text-foreground hover:bg-muted/50"
              aria-label="Settings"
              aria-expanded={settingsOpen}
            >
              <Settings className="h-5 w-5" size={20} />
            </button>
            {settingsOpen && (
              <div
                className="absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] py-1 shadow-lg backdrop-blur-md"
                role="menu"
              >
                <button
                  type="button"
                  onClick={() => toggleTheme()}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-muted/50 hover:text-accent"
                  role="menuitem"
                >
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4" size={16} />
                  ) : (
                    <Moon className="h-4 w-4" size={16} />
                  )}
                  <span>Color mode</span>
                </button>
                {isAuthenticated && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setSettingsOpen(false);
                        setChangePasswordOpen(true);
                        setChangeError("");
                        setChangeSuccess(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-muted/50 hover:text-accent"
                      role="menuitem"
                    >
                      Change password
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSettingsOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-muted/50 hover:text-accent"
                      role="menuitem"
                    >
                      Log out
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
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
