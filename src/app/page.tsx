import Link from "next/link";
import { Section } from "@/components/section";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Section id="home" className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
            Our Story
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Scroll to explore our moments together.
          </p>
          <Link
            href="#moments"
            className={cn(
              "inline-flex items-center justify-center font-medium rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              buttonVariants.variant.primary,
              buttonVariants.size.lg,
              "mt-6"
            )}
          >
            See moments
          </Link>
        </div>
      </Section>

      <Section id="our-story" className="bg-muted/30">
        <h2 className="text-3xl font-bold text-foreground">Our Story</h2>
        <p className="mt-4 text-muted-foreground">
          Your story section – add your text and photos here.
        </p>
      </Section>

      <Section id="moments">
        <h2 className="text-3xl font-bold text-foreground">Moments</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card variant="glass">
            <CardHeader>Moment 1</CardHeader>
            <CardContent>
              Add your photos and captions in each card.
            </CardContent>
          </Card>
          <Card variant="glass">
            <CardHeader>Moment 2</CardHeader>
            <CardContent>More moments to come.</CardContent>
          </Card>
          <Card variant="glass">
            <CardHeader>Moment 3</CardHeader>
            <CardContent>Parallax and gallery next.</CardContent>
          </Card>
        </div>
      </Section>

      <Section id="gallery" className="bg-muted/30">
        <h2 className="text-3xl font-bold text-foreground">Gallery</h2>
        <p className="mt-4 text-muted-foreground">
          Your picture gallery will go here.
        </p>
      </Section>

      <Section id="letter">
        <h2 className="text-3xl font-bold text-foreground">Letter</h2>
        <p className="mt-4 text-muted-foreground">
          Your letter section – write from the heart.
        </p>
      </Section>

      <Section id="end" className="bg-muted/30">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground">The End</h2>
          <p className="mt-4 text-muted-foreground">
            With love, always.
          </p>
        </div>
      </Section>
    </main>
  );
}
