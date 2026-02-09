"use client";

import { useEffect, useState } from "react";
import { Heart } from "@/components/icons";
import { useSecretMode } from "@/contexts/secret-mode-context";
import { cn } from "@/lib/utils";

const NO_MESSAGES = [
  "Are you sure?",
  "Really sure?",
  "Pleasee…",
  "Just think about it…",
  "I'm saddd…",
];

const BEAR_GIF_SRCS = [
  "https://tenor.com/embed/6869649078377594261", // (replaced 404) Love - teddy bears kissing, hearts
  "https://tenor.com/embed/11635372298041824893",
  "https://tenor.com/embed/2912093415419701311",
  "https://tenor.com/embed/13697198850853500144",
  "https://tenor.com/embed/2524119836194528553", // (replaced 404) Milk and Mocha - two bears hugging
];

export function ValentineSecret() {
  const { closeSecretMode } = useSecretMode();
  const [yesScale, setYesScale] = useState(1);
  const [messageIndex, setMessageIndex] = useState(0);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [bearIndex, setBearIndex] = useState(0);

  function handleNoClick() {
    if (hasAccepted) return;
    setYesScale((current) => Math.min(current * 1.35, 4));
    setMessageIndex((current) => (current + 1) % NO_MESSAGES.length);
    setBearIndex((current) => (current + 1) % BEAR_GIF_SRCS.length);
  }

  function handleYesClick() {
    setHasAccepted(true);
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeSecretMode();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeSecretMode]);

  const noMessage = NO_MESSAGES[messageIndex];
  const bearSrc = BEAR_GIF_SRCS[bearIndex];

  return (
    <div className="fixed inset-0 z-110 flex flex-col bg-gradient-to-b from-pink-50/95 via-rose-50/95 to-white/95 shadow-[inset_0_0_0_1px_var(--glass-border)] backdrop-blur-xl dark:from-slate-950 dark:via-slate-950 dark:to-slate-950">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/4 top-1/5 h-72 w-72 rounded-full bg-pink-200/60 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/5 h-80 w-80 rounded-full bg-rose-200/60 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-8 sm:py-10">
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={closeSecretMode}
            className="rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-md transition-colors hover:bg-accent hover:text-accent-foreground"
            aria-label="Close Valentine secret mode"
          >
            Close
          </button>
        </div>

        <div className="glass relative flex min-h-[70vh] flex-col justify-center overflow-hidden rounded-3xl border border-border bg-white/90 px-6 py-8 text-center shadow-2xl sm:px-12 sm:py-12 dark:bg-card/95">
          <div className="mx-auto mb-6 h-32 w-32 overflow-hidden rounded-3xl bg-pink-100 shadow-inner sm:h-36 sm:w-36 dark:bg-accent/15">
            <iframe
              src={bearSrc}
              title="Valentine bear"
              className="h-full w-full"
              allowFullScreen
            />
          </div>

          {!hasAccepted ? (
            <>
              <h2
                className="mb-4 font-serif text-foreground transition-colors duration-700"
                style={{
                  fontSize: "clamp(1.8rem, 5vw, 3rem)",
                  lineHeight: 1.2,
                }}
              >
                Will you be my Valentine?
              </h2>
              <p className="mb-8 text-sm text-muted-foreground sm:text-base">
                There&apos;s only one right answer… but I&apos;ll let you try both.
              </p>

              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
                <button
                  type="button"
                  onClick={handleYesClick}
                  className={cn(
                    "relative inline-flex items-center justify-center rounded-2xl bg-pink-500 px-10 py-4 text-lg font-semibold text-white shadow-xl transition-transform duration-300 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
                  )}
                  style={{
                    transform: `scale(${yesScale})`,
                    transformOrigin: "center",
                  }}
                >
                  Yes
                  <Heart
                    className="ml-2 h-5 w-5 text-white drop-shadow-sm"
                    size={20}
                    fill="currentColor"
                  />
                </button>

                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={handleNoClick}
                    className="inline-flex items-center justify-center rounded-2xl border border-border bg-muted px-6 py-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                  >
                    {noMessage}
                  </button>
                  <p className="max-w-[220px] text-xs text-muted-foreground">
                    (You know the right answer is yes.)
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2
                className="mb-4 font-serif text-foreground transition-colors duration-700"
                style={{
                  fontSize: "clamp(2rem, 5.5vw, 3.4rem)",
                  lineHeight: 1.2,
                }}
              >
                Knew you would say Yes!
              </h2>
              <p className="mb-6 text-sm text-muted-foreground sm:text-base">
                Thank you for being my Valentine, today and always. ♡
              </p>
              <div className="mb-6 flex justify-center gap-2">
                <Heart
                  className="h-8 w-8 text-accent animate-pulse"
                  size={32}
                  fill="currentColor"
                />
                <Heart
                  className="h-8 w-8 text-accent animate-bounce"
                  size={32}
                  fill="currentColor"
                />
                <Heart
                  className="h-8 w-8 text-accent animate-pulse"
                  size={32}
                  fill="currentColor"
                />
              </div>
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={closeSecretMode}
                  className="rounded-full bg-accent px-6 py-2 text-sm font-medium text-accent-foreground shadow-md transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                >
                  Back to our story
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("end");
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="rounded-full border border-border bg-card px-6 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                >
                  Take me to the end
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
