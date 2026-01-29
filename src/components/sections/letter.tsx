"use client";

import { PenLine } from "@/components/icons";

export function Letter() {
  return (
    <section
      id="letter"
      className="relative flex min-h-screen items-center justify-center px-6 py-24"
    >
      <div className="absolute inset-0 opacity-20">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl bg-accent/30" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl">
        <div className="glass rounded-3xl border border-border p-10 shadow-2xl md:p-16">
          <div className="mb-8 flex justify-center">
            <PenLine className="h-10 w-10 text-accent" size={40} />
          </div>

          <h2
            className="mb-8 text-center font-serif text-foreground transition-colors duration-700"
            style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}
          >
            To My Love
          </h2>

          <div
            className="space-y-6 text-card-foreground"
            style={{
              fontFamily: "var(--font-cursive), cursive, serif",
              fontSize: "1.125rem",
              lineHeight: 2,
            }}
          >
            <p>My Dearest,</p>

            <p>
              If I could give you one thing in life, I would give you the
              ability to see yourself through my eyes. Only then would you
              realize how special you are to me.
            </p>

            <p>
              You are the reason I wake up with a smile, the inspiration behind
              my dreams, and the peace in my storms. Your love has transformed
              me in ways I never thought possible—making me braver, kinder, and
              infinitely happier.
            </p>

            <p>
              Every day with you is a gift I never take for granted. In your
              arms, I&apos;ve found my safe haven. In your eyes, I&apos;ve found
              my home. In your heart, I&apos;ve found my forever.
            </p>

            <p>
              Thank you for choosing me, for loving me, for being you. You are
              everything I never knew I always needed.
            </p>

            <p className="pt-4">Forever yours,</p>

            <p className="font-serif text-2xl text-accent">
              With all my heart ♡
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
