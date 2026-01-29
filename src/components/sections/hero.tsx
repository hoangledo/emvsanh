"use client";

import { ChevronDown, Heart } from "@/components/icons";
import { useScroll } from "@/components/scroll-provider";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

export function Hero() {
  const { scrollY } = useScroll();
  const { theme } = useTheme();
  const parallaxOffset = scrollY * 0.5;
  const scrollToNext = () => {
    document.getElementById("story")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{ transform: `translateY(${parallaxOffset}px)` }}
      >
        <div
          className={cn(
            "absolute left-10 top-20 h-72 w-72 rounded-full blur-3xl",
            theme === "dark" ? "bg-accent/30" : "bg-primary/40"
          )}
        />
        <div
          className={cn(
            "absolute bottom-20 right-10 h-96 w-96 rounded-full blur-3xl",
            theme === "dark" ? "bg-muted/20" : "bg-muted/40"
          )}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <div
          className="mb-8 inline-block"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        >
          <Heart className="mx-auto mb-6 h-20 w-20 text-accent animate-pulse" size={80} fill="currentColor" />
        </div>

        <h1
          className="mb-6 font-serif text-foreground transition-colors duration-700"
          style={{
            fontSize: "clamp(2.5rem, 8vw, 6rem)",
            lineHeight: 1.1,
            transform: `translateY(${scrollY * 0.2}px)`,
          }}
        >
          Every Love Story
          <br />
          <span className="text-accent">Is Beautiful</span>
        </h1>

        <p
          className="mx-auto mb-12 max-w-2xl text-lg text-muted-foreground md:text-xl transition-colors duration-700"
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        >
          But ours is my favorite
        </p>

        <button
          type="button"
          onClick={scrollToNext}
          className="glass group rounded-full border border-border px-8 py-4 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        >
          <span className="flex items-center gap-2 text-foreground">
            See our moments
            <Heart className="h-4 w-4 text-accent transition-transform group-hover:scale-110" size={16} fill="currentColor" />
          </span>
        </button>

        <div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce"
          style={{ opacity: Math.max(0, 1 - scrollY / 300) }}
        >
          <ChevronDown className="h-8 w-8 text-accent" size={32} />
        </div>
      </div>
    </section>
  );
}
