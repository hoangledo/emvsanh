"use client";

import { Calendar } from "@/components/icons";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { moments } from "@/data/moments";

export function Moments() {
  return (
    <section id="moments" className="relative px-6 py-24 min-h-screen">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <Calendar className="mx-auto mb-4 h-12 w-12 text-accent" size={48} />
          <h2
            className="font-serif text-foreground transition-colors duration-700"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            Our Moments
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A collection of memories that make my heart smile
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {moments.map((moment, index) => (
            <div
              key={moment.title}
              className="group"
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
              }}
            >
              <div className="glass overflow-hidden rounded-2xl border border-border transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                <div className="relative h-64 overflow-hidden">
                  <ImageWithFallback
                    src={moment.image}
                    alt={moment.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                <div className="p-6">
                  <h3 className="mb-2 font-serif text-foreground transition-colors duration-700">
                    {moment.title}
                  </h3>
                  <p className="mb-3 text-sm text-muted-foreground">
                    {moment.date}
                  </p>
                  <p className="text-sm leading-relaxed text-card-foreground">
                    {moment.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
