"use client";

import { ImageIcon } from "@/components/icons";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { galleryImages } from "@/data/gallery";

export function Gallery() {
  return (
    <section id="gallery" className="relative min-h-screen px-6 py-24">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute left-1/3 top-1/3 h-96 w-96 rounded-full blur-3xl bg-accent/40" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <ImageIcon className="mx-auto mb-4 h-12 w-12 text-accent" size={48} />
          <h2
            className="font-serif text-foreground transition-colors duration-700"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            Gallery
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Captured moments, endless memories
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
          {galleryImages.map((image, index) => (
            <div
              key={image.alt}
              className="group relative aspect-square overflow-hidden rounded-2xl"
              style={{
                animation: `fadeIn 0.8s ease-out ${index * 0.15}s both`,
              }}
            >
              <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 transition-all duration-500 group-hover:opacity-100 bg-muted/40 backdrop-blur-sm">
                <ImageIcon className="h-8 w-8 text-foreground" size={32} />
              </div>

              <ImageWithFallback
                src={image.url}
                alt={image.alt}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
