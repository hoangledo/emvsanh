"use client";

import { Sparkles } from "@/components/icons";
import { useScroll } from "@/components/scroll-provider";

export function OurStory() {
  const { scrollY } = useScroll();
  const sectionTop = 800;
  const parallaxOffset = (scrollY - sectionTop) * 0.3;

  return (
    <section
      id="story"
      className="relative flex min-h-screen items-center justify-center px-6 py-24"
    >
      <div
        className="absolute inset-0 opacity-20"
        style={{ transform: `translateY(${parallaxOffset}px)` }}
      >
        <div className="absolute right-1/4 top-1/4 h-64 w-64 rounded-full blur-3xl bg-accent/30" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        <div className="glass rounded-3xl border border-border p-12 shadow-lg md:p-16">
          <div className="mb-8 flex justify-center">
            <Sparkles className="h-10 w-10 text-accent" size={40} />
          </div>

          <h2
            className="mb-8 text-center font-serif text-foreground transition-colors duration-700"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            Our Story
          </h2>

          <div className="space-y-6 text-card-foreground">
            <p className="text-lg leading-relaxed">
              They say that when you meet the right person, you just know. For
              us, it wasn&apos;t love at first sight—it was something deeper. It
              was recognition, like our souls had been searching for each other
              across lifetimes.
            </p>

            <p className="text-lg leading-relaxed">
              From our first conversation that lasted until sunrise, to the
              comfortable silences we now share, every moment with you has been
              a treasure. You&apos;ve shown me what it means to be truly seen,
              truly loved, truly home.
            </p>

            <p className="text-lg leading-relaxed">
              Together, we&apos;ve laughed until our sides hurt, held each other
              through tears, danced in the kitchen, and built a life filled with
              warmth and wonder. You are my favorite hello and my hardest
              goodbye.
            </p>

            <p className="pt-4 text-center font-serif italic">
              This is our story—and it&apos;s still being written, one beautiful
              day at a time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
