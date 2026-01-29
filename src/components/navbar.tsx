"use client";

import { Logo } from "@/components/logo";
import { Menu, Moon, Sun, X } from "@/components/icons";
import Link from "next/link";
import { useScroll } from "@/components/scroll-provider";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#story", label: "Story" },
  { href: "#moments", label: "Moments" },
  { href: "#gallery", label: "Gallery" },
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();
  const scrollPastThreshold = scrollY > 50;

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
            onClick={toggleTheme}
            className="ml-2 rounded-full p-2 text-foreground hover:bg-muted/50 hover:text-accent transition-colors"
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
          </div>
        </div>
      )}
    </header>
  );
}
