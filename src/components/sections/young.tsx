"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { youngPhotos } from "@/data/young";
import { ImageIcon } from "@/components/icons";

export function Young() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Ensure refs length matches photos
  const photos = useMemo(() => youngPhotos, []);

  // Scroll to the active photo when opening the lightbox
  useEffect(() => {
    if (activeIndex === null) return;
    const el = itemRefs.current[activeIndex];
    if (el && el.scrollIntoView) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeIndex]);

  const closeLightbox = () => {
    setActiveIndex(null);
  };

  const showPrev = () => {
    setActiveIndex((current) => {
      if (current === null) return null;
      const nextIndex = (current - 1 + photos.length) % photos.length;
      return nextIndex;
    });
  };

  const showNext = () => {
    setActiveIndex((current) => {
      if (current === null) return null;
      const nextIndex = (current + 1) % photos.length;
      return nextIndex;
    });
  };

  // Close on Escape key
  useEffect(() => {
    if (activeIndex === null) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeLightbox();
      } else if (event.key === "ArrowLeft") {
        showPrev();
      } else if (event.key === "ArrowRight") {
        showNext();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIndex]);

  return (
    <section id="young" className="relative min-h-screen px-6 py-24">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute left-1/4 top-1/4 h-80 w-80 rounded-full blur-3xl bg-accent/40" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <ImageIcon className="mx-auto mb-4 h-12 w-12 text-accent" size={48} />
          <h2
            className="font-serif text-foreground transition-colors duration-700"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            When We Were Younger
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A little album of our younger days, one memory at a time
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
          {photos.map((photo, index) => (
            <button
              key={photo.src}
              type="button"
              className="group relative overflow-hidden rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              onClick={() => setActiveIndex(index)}
              style={{
                animation: `fadeIn 0.8s ease-out ${index * 0.1}s both`,
              }}
            >
              <div className="relative aspect-3/4 w-full overflow-hidden rounded-2xl">
                <ImageWithFallback
                  src={photo.src}
                  alt={photo.alt}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {activeIndex !== null && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-6 py-4">
              <h3 className="font-serif text-lg text-foreground md:text-2xl">
                Young memories ({activeIndex + 1}/{photos.length})
              </h3>
              <button
                type="button"
                className="rounded-full border border-border bg-card px-3 py-1 text-sm text-muted-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={closeLightbox}
              >
                Close
              </button>
            </div>

            <div
              ref={containerRef}
              className="flex-1 overflow-y-auto scroll-smooth snap-y snap-mandatory px-4 pb-8"
            >
              {photos.map((photo, index) => (
                <div
                  key={photo.src}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  className="snap-center flex min-h-[80vh] flex-col items-center justify-center py-8"
                >
                  <div className="glass max-w-3xl w-full rounded-3xl border border-border p-4 shadow-2xl">
                    <div className="relative mx-auto mb-4 max-h-[60vh] w-full overflow-hidden rounded-2xl">
                      <ImageWithFallback
                        src={photo.src}
                        alt={photo.alt}
                        className="mx-auto max-h-[60vh] w-full object-contain"
                      />
                    </div>
                    <div className="space-y-2 px-1 pb-2 pt-1 text-center">
                      <p className="text-sm font-medium text-foreground md:text-base">
                        {photo.alt}
                      </p>
                      <p className="text-sm text-muted-foreground md:text-base">
                        {photo.note}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between px-6 pb-4 pt-2">
              <button
                type="button"
                className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={showPrev}
              >
                Previous
              </button>
              <button
                type="button"
                className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={showNext}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

