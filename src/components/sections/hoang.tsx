"use client";

import { useEffect, useState } from "react";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { hoangPhotos } from "@/data/hoang";
import { Heart } from "@/components/icons";

const PHOTOS_PER_PAGE_MOBILE = 8;

export function Hoang() {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const totalPagesMobile = Math.ceil(hoangPhotos.length / PHOTOS_PER_PAGE_MOBILE);
  const startMobile = (currentPage - 1) * PHOTOS_PER_PAGE_MOBILE;
  const pagePhotosMobile = hoangPhotos.slice(startMobile, startMobile + PHOTOS_PER_PAGE_MOBILE);

  const closeModal = () => setActiveIndex(null);

  const showPrev = () => {
    setActiveIndex((current) => {
      if (current === null) return null;
      return (current - 1 + hoangPhotos.length) % hoangPhotos.length;
    });
  };

  const showNext = () => {
    setActiveIndex((current) => {
      if (current === null) return null;
      return (current + 1) % hoangPhotos.length;
    });
  };

  // Keyboard navigation for the focus modal
  useEffect(() => {
    if (activeIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      } else if (event.key === "ArrowLeft") {
        showPrev();
      } else if (event.key === "ArrowRight") {
        showNext();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex]);

  return (
    <section id="gallery" className="relative min-h-screen px-6 py-24">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute right-1/4 top-1/4 h-96 w-96 rounded-full blur-3xl bg-accent/40" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <Heart className="mx-auto mb-4 h-12 w-12 text-accent" size={48} fill="currentColor" />
          <h2
            className="font-serif text-foreground transition-colors duration-700"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            Our Days Together
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A flowing wall of little moments that still make my heart smile
          </p>
        </div>

        {/* Mobile: paginated grid */}
        <div className="md:hidden">
          <div className="grid grid-cols-2 gap-4">
            {pagePhotosMobile.map((photo, index) => {
              const globalIndex = startMobile + index;
              return (
                <button
                  key={photo.src}
                  type="button"
                  className="group relative overflow-hidden rounded-2xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  onClick={() => setActiveIndex(globalIndex)}
                  style={{
                    animation: `fadeIn 0.6s ease-out ${index * 0.05}s both`,
                  }}
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl">
                    <ImageWithFallback
                      src={photo.src}
                      alt={photo.alt}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 via-black/30 to-transparent px-3 pb-2 pt-8">
                      <p className="text-xs font-medium text-accent-foreground/90">
                        {photo.alt}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
            >
              Previous page
            </button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPagesMobile}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPagesMobile}
              onClick={() => setCurrentPage((p) => Math.min(totalPagesMobile, p + 1))}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
            >
              Next page
            </button>
          </div>
        </div>

        {/* Desktop: masonry (unchanged) */}
        <div className="hidden columns-1 gap-4 md:columns-2 md:block lg:columns-3">
          {hoangPhotos.map((photo, index) => (
            <button
              key={photo.src}
              type="button"
              className="mb-4 inline-block w-full break-inside-avoid rounded-2xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              style={{
                animation: `fadeIn 0.8s ease-out ${index * 0.05}s both`,
              }}
              onClick={() => setActiveIndex(index)}
            >
              <div className="relative w-full overflow-hidden rounded-2xl">
                <ImageWithFallback
                  src={photo.src}
                  alt={photo.alt}
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 via-black/30 to-transparent px-4 pb-3 pt-10">
                  <p className="text-sm font-medium text-accent-foreground/90">
                    {photo.alt}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {activeIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-xl">
          <div className="glass relative mx-4 max-h-[90vh] w-full max-w-3xl rounded-3xl border border-border p-4 shadow-2xl md:p-6">
            <div className="flex items-center justify-between pb-3">
              <p className="text-sm font-medium text-muted-foreground md:text-base">
                Together moments ({activeIndex + 1}/{hoangPhotos.length})
              </p>
              <button
                type="button"
                className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors md:text-sm"
                onClick={closeModal}
              >
                Close
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="relative max-h-[60vh] w-full overflow-hidden rounded-2xl">
                <ImageWithFallback
                  src={hoangPhotos[activeIndex].src}
                  alt={hoangPhotos[activeIndex].alt}
                  className="mx-auto max-h-[60vh] w-full object-contain"
                />
              </div>

              <div
                className="space-y-2 text-center"
                style={{ fontFamily: "var(--font-serif), system-ui, -apple-system, BlinkMacSystemFont" }}
              >
                <p className="text-base font-semibold text-foreground md:text-lg">
                  {hoangPhotos[activeIndex].alt}
                </p>
                {hoangPhotos[activeIndex].note && (
                  <p className="text-sm text-muted-foreground md:text-base">
                    {hoangPhotos[activeIndex].note}
                  </p>
                )}
              </div>

              <div className="mt-2 flex items-center justify-between">
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
        </div>
      )}
    </section>
  );
}

