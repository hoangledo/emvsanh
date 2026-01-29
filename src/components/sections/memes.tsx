"use client";

import { useEffect, useRef, useState } from "react";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { memeMoments } from "@/data/memes";
import { Heart } from "@/components/icons";

export function Memes() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const goPrev = () => {
    setCurrentIndex((i) => (i - 1 + memeMoments.length) % memeMoments.length);
  };

  const goNext = () => {
    setCurrentIndex((i) => (i + 1) % memeMoments.length);
  };

  // Scroll the active slide into view when currentIndex changes (e.g. after prev/next click)
  useEffect(() => {
    const el = slideRefs.current[currentIndex];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [currentIndex]);

  // Update currentIndex when user swipes/scrolls so the position indicator stays correct (debounced)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const scrollLeft = container.scrollLeft;
        const containerCenter = scrollLeft + container.clientWidth / 2;
        let bestIndex = 0;
        let bestDistance = Infinity;
        slideRefs.current.forEach((slide, index) => {
          if (!slide) return;
          const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
          const distance = Math.abs(containerCenter - slideCenter);
          if (distance < bestDistance) {
            bestDistance = distance;
            bestIndex = index;
          }
        });
        setCurrentIndex(bestIndex);
      }, 100);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(timeoutId);
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section id="memes" className="relative min-h-screen px-6 py-24">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute left-1/3 top-1/4 h-80 w-80 rounded-full blur-3xl bg-accent/40" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <Heart className="mx-auto mb-4 h-12 w-12 text-accent" size={48} fill="currentColor" />
          <h2
            className="font-serif text-foreground transition-colors duration-700"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            Funny, cute & embarrassing moments
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            The moments we&apos;ll never forget (and maybe wish we could)
          </p>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto overflow-y-hidden pb-4 scroll-smooth snap-x snap-mandatory [-webkit-overflow-scrolling:touch]"
          aria-label="Funny and embarrassing moments carousel"
        >
          {memeMoments.map((moment, index) => (
            <div
              key={moment.src}
              ref={(el) => {
                slideRefs.current[index] = el;
              }}
              className="flex w-[85vw] min-w-[280px] max-w-[360px] shrink-0 snap-center snap-always md:w-[45vw] lg:w-[32%]"
              style={{
                animation: `fadeIn 0.6s ease-out ${index * 0.03}s both`,
              }}
            >
              <div className="glass flex h-full flex-col overflow-hidden rounded-2xl border border-border">
                <div className="relative aspect-square w-full overflow-hidden">
                  <ImageWithFallback
                    src={moment.src}
                    alt={moment.alt}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                {moment.note && (
                  <div className="flex flex-col gap-1 p-4">
                    <p className="text-sm font-semibold text-foreground">{moment.alt}</p>
                    <p className="text-sm text-muted-foreground">{moment.note}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={goPrev}
            className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            aria-label="Previous moment"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {memeMoments.length}
          </span>
          <button
            type="button"
            onClick={goNext}
            className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            aria-label="Next moment"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
