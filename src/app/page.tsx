import { End } from "@/components/sections/end";
import { Foods } from "@/components/sections/foods";
import { Hoang } from "@/components/sections/hoang";
import { Memes } from "@/components/sections/memes";
import { Hero } from "@/components/sections/hero";
import { Letter } from "@/components/sections/letter";
import { Mai } from "@/components/sections/mai";
import { Moments } from "@/components/sections/moments";
import { Young } from "@/components/sections/young";
import { OurStory } from "@/components/sections/our-story";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <OurStory />
      <Moments />
      <Young />
      <Mai />
      <Hoang />
      <Foods />
      <Memes />
      <Letter />
      <End />
    </main>
  );
}
