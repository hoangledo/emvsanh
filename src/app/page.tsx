import { End } from "@/components/sections/end";
import { Gallery } from "@/components/sections/gallery";
import { Hero } from "@/components/sections/hero";
import { Letter } from "@/components/sections/letter";
import { Moments } from "@/components/sections/moments";
import { OurStory } from "@/components/sections/our-story";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <OurStory />
      <Moments />
      <Gallery />
      <Letter />
      <End />
    </main>
  );
}
