"use client";

import { useEffect, useState } from "react";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { maiPhotos } from "@/data/mai";
import { Heart } from "@/components/icons";

const PHOTOS_PER_PAGE = 12;

export function Mai() {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const totalPages = Math.ceil(maiPhotos.length / PHOTOS_PER_PAGE);
  const start = (currentPage - 1) * PHOTOS_PER_PAGE;
  const pagePhotos = maiPhotos.slice(start, start + PHOTOS_PER_PAGE);

  const closeLightbox = () => setActiveIndex(null);

  const showPrev = () => {
    setActiveIndex((current) => {
      if (current === null) return null;
      return (current - 1 + maiPhotos.length) % maiPhotos.length;
    });
  };

  const showNext = () => {
    setActiveIndex((current) => {
      if (current === null) return null;
      return (current + 1) % maiPhotos.length;
    });
  };

  useEffect(() => {
    if (activeIndex === null) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
      else if (event.key === "ArrowLeft") showPrev();
      else if (event.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIndex]);

  return (
    <section id="mai" className="relative min-h-screen px-6 py-24">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute right-1/4 top-1/4 h-80 w-80 rounded-full blur-3xl bg-accent/40" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <Heart className="mx-auto mb-4 h-12 w-12 text-accent" size={48} fill="currentColor" />
          <h2
            className="font-serif text-foreground transition-colors duration-700"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            With Mai
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Moments with Mai – a scroll of memories
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {pagePhotos.map((photo, index) => {
            const globalIndex = start + index;
            return (
              <button
                key={photo.src}
                type="button"
                className="group relative overflow-hidden rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                onClick={() => setActiveIndex(globalIndex)}
                style={{
                  animation: `fadeIn 0.6s ease-out ${Math.min(index * 0.05, 0.5)}s both`,
                }}
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-2xl">
                  <ImageWithFallback
                    src={photo.src}
                    alt={photo.alt}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </div>
                <p className="mt-2 text-center text-xs font-medium text-muted-foreground sm:text-sm">
                  {photo.alt}
                </p>
              </button>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
          >
            Previous page
          </button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
          >
            Next page
          </button>
        </div>
      </div>

      {activeIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-xl">
          <div className="glass relative mx-4 flex max-h-[90vh] w-full max-w-4xl flex-col rounded-3xl border border-border p-4 shadow-2xl md:p-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground md:text-base">
                {activeIndex + 1} / {maiPhotos.length}
              </span>
              <button
                type="button"
                className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground md:text-sm"
                onClick={closeLightbox}
              >
                Close
              </button>
            </div>
            <div className="relative max-h-[75vh] w-full overflow-hidden rounded-2xl">
              <ImageWithFallback
                src={maiPhotos[activeIndex].src}
                alt={maiPhotos[activeIndex].alt}
                className="mx-auto max-h-[75vh] w-full object-contain"
              />
            </div>
            <p className="mt-3 text-center text-sm font-medium text-foreground md:text-base">
              {maiPhotos[activeIndex].alt}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                onClick={showPrev}
              >
                Previous
              </button>
              <button
                type="button"
                className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
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
