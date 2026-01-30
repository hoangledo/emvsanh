"use client";

import { useState } from "react";
import {
  Facebook,
  Instagram,
  LinkedIn,
  Mail,
  PenLine,
  Plus,
  Trash2,
} from "@/components/icons";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/contexts/auth-context";
import {
  herAndIStaticConfig,
  type HerAndIStaticPerson,
  type HerAndISocial,
} from "@/data/her-and-i";
import {
  useHerAndI,
  type HerAndIPhoto,
  type HerAndIPersonSlug,
} from "@/hooks/use-her-and-i";
import { cn } from "@/lib/utils";

const MAX_INTRO_PHOTOS = 3;

const FAN_LEFT = "15%";
const FAN_CENTER = "50%";
const FAN_RIGHT = "85%";
const FAN_ROTATIONS = ["-rotate-[12deg]", "rotate-0", "rotate-[12deg]"];
const FAN_Z = ["z-10", "z-20", "z-10"];

function IntroPhotoRow({
  photos,
  name,
  canEdit,
  onRemove,
  onRefetch,
}: {
  photos: { id?: string; url: string }[];
  name: string;
  canEdit: boolean;
  onRemove: (id: string) => Promise<void>;
  onRefetch: () => void;
}) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const displayPhotos = photos.slice(0, MAX_INTRO_PHOTOS);
  const positions = [FAN_LEFT, FAN_CENTER, FAN_RIGHT];
  const getPositionIndex = (i: number) =>
    displayPhotos.length === 1
      ? 1
      : displayPhotos.length === 2
        ? [0, 2][i]
        : i;

  return (
    <>
      <div className="relative mx-auto h-[380px] w-full max-w-[520px] sm:h-[420px]">
        {displayPhotos.map((photo, i) => {
          const posIdx = getPositionIndex(i);
          return (
          <div
            key={photo.id ?? `photo-${i}`}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ease-out",
              "hover:z-30 hover:scale-110 hover:-translate-y-3 hover:drop-shadow-2xl",
              FAN_ROTATIONS[posIdx],
              FAN_Z[posIdx]
            )}
            style={{
              left: positions[posIdx],
              marginLeft: posIdx === 1 ? "-114px" : "-100px",
            }}
          >
            <div
              role="button"
              tabIndex={0}
              onClick={() => setLightboxUrl(photo.url)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setLightboxUrl(photo.url);
                }
              }}
              className="h-[280px] w-[200px] overflow-hidden rounded-2xl border border-border shadow-lg sm:h-[320px] sm:w-[228px]"
              aria-label={`View ${name} photo ${i + 1}`}
            >
              <ImageWithFallback
                src={photo.url}
                alt={`${name} ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
            {canEdit && photo.id && (
              <button
                type="button"
                onClick={async (e) => {
                  e.stopPropagation();
                  await onRemove(photo.id!);
                  onRefetch();
                }}
                className="absolute right-2 top-2 z-40 rounded-full bg-black/60 p-2 text-white shadow hover:bg-red-600"
                aria-label="Remove photo"
              >
                <Trash2 className="h-4 w-4" size={16} />
              </button>
            )}
          </div>
          );
        })}
      </div>

      <Modal
        open={!!lightboxUrl}
        onClose={() => setLightboxUrl(null)}
        title="View photo"
      >
        {lightboxUrl && (
          <div className="relative">
            <img
              src={lightboxUrl}
              alt="Enlarged"
              className="max-h-[70vh] w-full rounded-lg object-contain"
            />
          </div>
        )}
      </Modal>
    </>
  );
}

function SocialLinks({ social }: { social: HerAndISocial }) {
  const links = [
    {
      key: "facebook" as const,
      href: social.facebook || "#",
      Icon: Facebook,
    },
    {
      key: "instagram" as const,
      href: social.instagram || "#",
      Icon: Instagram,
    },
    {
      key: "email" as const,
      href: social.email ? `mailto:${social.email}` : "#",
      Icon: Mail,
    },
    {
      key: "linkedin" as const,
      href: social.linkedin || "#",
      Icon: LinkedIn,
    },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {links.map(({ key, href, Icon }) => (
        <a
          key={key}
          href={href}
          target={href === "#" ? undefined : "_blank"}
          rel={href === "#" ? undefined : "noopener noreferrer"}
          className="rounded-full p-2 text-muted-foreground transition-colors hover:text-accent"
          aria-label={key}
        >
          <Icon className="h-6 w-6" size={24} />
        </a>
      ))}
    </div>
  );
}

function HerAndIIntroCard({
  staticPerson,
  intro,
  photos,
  canEdit,
  onRefetch,
}: {
  staticPerson: HerAndIStaticPerson;
  intro: string;
  photos: HerAndIPhoto[];
  canEdit: boolean;
  onRefetch: () => void;
}) {
  const [editIntroOpen, setEditIntroOpen] = useState(false);
  const [editIntroValue, setEditIntroValue] = useState(intro);

  const displayPhotos = photos.map((p) => ({ id: p.id, url: p.url }));
  const displayIntro = intro || "Add a short introduction here.";

  async function handleSaveIntro() {
    const res = await fetch(
      `/api/her-and-i/intro?person=${staticPerson.slug}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intro: editIntroValue }),
      }
    );
    if (res.ok) {
      setEditIntroOpen(false);
      onRefetch();
    }
  }

  async function handleAddPhoto(formData: FormData) {
    formData.set("person", staticPerson.slug);
    await fetch("/api/her-and-i/photos", {
      method: "POST",
      body: formData,
    });
  }

  async function handleRemovePhoto(id: string) {
    await fetch(`/api/her-and-i/photos/${id}`, { method: "DELETE" });
  }

  const [adding, setAdding] = useState(false);
  const canAddPhoto = photos.length < MAX_INTRO_PHOTOS;

  async function handleAdd(formData: FormData) {
    await handleAddPhoto(formData);
    setAdding(false);
    onRefetch();
  }

  return (
    <div className="flex flex-col items-center text-center">
      <IntroPhotoRow
        photos={displayPhotos}
        name={staticPerson.name}
        canEdit={canEdit}
        onRemove={handleRemovePhoto}
        onRefetch={onRefetch}
      />
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <h3 className="font-serif text-2xl text-foreground transition-colors duration-700 sm:text-3xl">
          {staticPerson.name}
        </h3>
        {canEdit && canAddPhoto && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-accent hover:text-accent"
            aria-label="Add photo"
          >
            <Plus className="h-5 w-5" size={20} />
          </button>
        )}
      </div>
      <div className="relative mt-4 max-w-md">
        <p className="text-muted-foreground leading-relaxed">
          {displayIntro}
        </p>
        {canEdit && (
          <button
            type="button"
            onClick={() => {
              setEditIntroValue(intro);
              setEditIntroOpen(true);
            }}
            className="mt-2 inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
            aria-label="Edit introduction"
          >
            <PenLine className="h-4 w-4" size={16} />
            Edit intro
          </button>
        )}
      </div>
      <div className="mt-6">
        <SocialLinks social={staticPerson.social} />
      </div>

      <Modal
        open={adding}
        onClose={() => setAdding(false)}
        title="Add intro photo"
      >
        <form
          className="flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            await handleAdd(new FormData(e.currentTarget));
          }}
        >
          <input
            type="file"
            name="file"
            accept="image/*"
            required
            className="rounded border border-border bg-card px-3 py-2 text-sm text-foreground"
          />
          <input type="hidden" name="person" value={staticPerson.slug} />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-accent px-4 py-2 text-sm text-accent-foreground"
            >
              Add
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={editIntroOpen}
        onClose={() => setEditIntroOpen(false)}
        title="Edit introduction"
      >
        <div className="flex flex-col gap-4">
          <textarea
            value={editIntroValue}
            onChange={(e) => setEditIntroValue(e.target.value)}
            placeholder="A short introduction..."
            rows={4}
            className="rounded border border-border bg-card px-3 py-2 text-foreground placeholder:text-muted-foreground"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditIntroOpen(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveIntro}
              className="rounded-lg bg-accent px-4 py-2 text-sm text-accent-foreground"
            >
              Save
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export function Moments() {
  const { data, loading, refetch } = useHerAndI();
  const { isAuthenticated } = useAuth();

  if (loading && !data) {
    return (
      <section id="her-and-i" className="relative min-h-screen px-6 py-24">
        <div className="mx-auto max-w-7xl text-center text-muted-foreground">
          Loading…
        </div>
      </section>
    );
  }

  const hoangData = data?.hoang ?? { intro: "", photos: [] };
  const maiData = data?.mai ?? { intro: "", photos: [] };
  const hoangStatic = herAndIStaticConfig.find((p) => p.slug === "hoang")!;
  const maiStatic = herAndIStaticConfig.find((p) => p.slug === "mai")!;

  return (
    <section id="her-and-i" className="relative min-h-screen px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2
            className="font-serif text-foreground transition-colors duration-700"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            Her and I
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A little about us
          </p>
        </div>

        <div className="grid grid-cols-1 gap-16 md:grid-cols-2 lg:gap-20">
          <HerAndIIntroCard
            staticPerson={hoangStatic}
            intro={hoangData.intro}
            photos={hoangData.photos}
            canEdit={isAuthenticated}
            onRefetch={refetch}
          />
          <HerAndIIntroCard
            staticPerson={maiStatic}
            intro={maiData.intro}
            photos={maiData.photos}
            canEdit={isAuthenticated}
            onRefetch={refetch}
          />
        </div>
      </div>
    </section>
  );
}
