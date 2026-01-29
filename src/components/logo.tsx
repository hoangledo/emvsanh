"use client";

import { Heart } from "@/components/icons";

type LogoVariant = 1 | 2 | 3;

export function Logo({ variant }: { variant: LogoVariant }) {

  if (variant === 1) {
    return (
      <div
        className="font-serif flex items-center gap-1 text-foreground"
        style={{ fontSize: "2rem" }}
      >
        <span>Em</span>
        <Heart
          className="h-10 w-10 text-accent shrink-0"
          size={40}
          fill="currentColor"
        />
        <span>Anh</span>
      </div>
    );
  }

  if (variant === 2) {
    return (
      <div className="relative">
        <div
          className="font-serif text-foreground"
          style={{ fontSize: "2.5rem", letterSpacing: "0.1em" }}
        >
          E&A
        </div>
        <Heart
          className="absolute -top-2 -right-2 h-6 w-6 text-accent"
          size={24}
          fill="currentColor"
        />
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        className="font-serif text-foreground"
        style={{
          fontSize: "4rem",
          lineHeight: 1,
          fontWeight: 300,
        }}
      >
        EA
      </div>
      <Heart
        className="absolute top-0 right-0 h-4 w-4 text-accent translate-x-2 -translate-y-2"
        size={16}
        fill="currentColor"
      />
    </div>
  );
}
