"use client";

import { Heart, Infinity } from "@/components/icons";
import { Logo } from "@/components/logo";

export function End() {
  return (
    <section className="relative flex min-h-screen items-center justify-center px-6 py-24">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute left-1/4 top-1/4 h-80 w-80 rounded-full blur-3xl bg-accent/30" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full blur-3xl bg-muted/20" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <div className="mb-8 flex items-center justify-center gap-4">
          <Heart className="h-16 w-16 text-accent animate-pulse" size={64} fill="currentColor" />
          <Infinity className="h-16 w-16 text-accent" size={64} />
          <Heart
            className="h-16 w-16 text-accent animate-pulse"
            size={64}
            fill="currentColor"
            style={{ animationDelay: "0.5s" }}
          />
        </div>

        <h2
          className="mb-6 font-serif text-foreground transition-colors duration-700"
          style={{
            fontSize: "clamp(2rem, 6vw, 4rem)",
            lineHeight: 1.2,
          }}
        >
          With Love,
          <br />
          Always
        </h2>

        <p className="mb-8 text-xl text-muted-foreground">
          Today, tomorrow, and for all the days to come
        </p>

        <div className="glass mx-auto max-w-2xl rounded-2xl border border-border p-8">
          <p className="font-serif text-lg italic text-foreground">
            &quot;In all the world, there is no heart for me like yours.
            <br />
            In all the world, there is no love for you like mine.&quot;
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            — Maya Angelou
          </p>
        </div>

        <div className="mt-16 border-t border-border pt-8">
          <div className="mb-4 flex justify-center">
            <Logo variant={2} />
          </div>
          <p className="text-sm text-muted-foreground opacity-80">
            Made with ♡ on Valentine&apos;s Day 2026
          </p>
        </div>
      </div>
    </section>
  );
}
