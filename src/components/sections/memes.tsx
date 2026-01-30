"use client";

import { useEffect, useRef, useState } from "react";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { useAlbumImages } from "@/hooks/use-album-images";
import { useAuth } from "@/contexts/auth-context";
import { Heart, PenLine, Plus, Trash2 } from "@/components/icons";
import { Modal } from "@/components/ui/modal";
import { memeMoments } from "@/data/memes";

type DisplayItem = { id: string; url: string; alt: string; note: string | null };

export function Memes() {
  const { items, loading, refetch } = useAlbumImages("memes");
  const { isAuthenticated } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState<DisplayItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fallback: DisplayItem[] = memeMoments.map((p, i) => ({
    id: `fallback-${i}`,
    url: p.src,
    alt: p.alt,
    note: p.note ?? null,
  }));
  const displayItems: DisplayItem[] =
    items.length > 0
      ? items.map((r) => ({ id: r.id, url: r.url, alt: r.alt, note: r.note }))
      : fallback;
  const canEdit = isAuthenticated;

  const goPrev = () => {
    setCurrentIndex((i) =>
      (i - 1 + displayItems.length) % displayItems.length
    );
  };
  const goNext = () => {
    setCurrentIndex((i) => (i + 1) % displayItems.length);
  };

  useEffect(() => {
    const el = slideRefs.current[currentIndex];
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [currentIndex, displayItems.length]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    let timeoutId: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const scrollLeft = container.scrollLeft;
        const containerCenter = scrollLeft + container.clientWidth / 2;
        let bestIndex = 0;
        let bestDistance = Infinity;
        slideRefs.current.forEach((slide, index) => {
          if (!slide) return;
          const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
          const distance = Math.abs(containerCenter - slideCenter);
          if (distance < bestDistance) {
            bestDistance = distance;
            bestIndex = index;
          }
        });
        setCurrentIndex(bestIndex);
      }, 100);
    };
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(timeoutId);
      container.removeEventListener("scroll", handleScroll);
    };
  }, [displayItems.length]);

  async function handleAdd(formData: FormData) {
    const file = formData.get("file") as File | null;
    if (!file?.size) return;
    const fd = new FormData();
    fd.set("section", "memes");
    fd.set("alt", (formData.get("alt") as string) ?? "");
    fd.set("note", (formData.get("note") as string) ?? "");
    fd.set("file", file);
    const res = await fetch("/api/album/images", { method: "POST", body: fd });
    if (res.ok) {
      setAddOpen(false);
      refetch();
    }
  }

  async function handleEdit(id: string, alt: string, note: string) {
    const res = await fetch(`/api/album/images/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alt, note }),
    });
    if (res.ok) {
      setEditOpen(null);
      refetch();
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/album/images/${id}`, { method: "DELETE" });
    if (res.ok) {
      setDeleteId(null);
      refetch();
    }
  }

  if (loading && items.length === 0) {
    return (
      <section id="memes" className="relative min-h-screen px-6 py-24">
        <div className="mx-auto max-w-7xl text-center text-muted-foreground">
          Loading…
        </div>
      </section>
    );
  }

  return (
    <section id="memes" className="relative min-h-screen px-6 py-24">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute left-1/3 top-1/4 h-80 w-80 rounded-full blur-3xl bg-accent/40" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <Heart
            className="mx-auto mb-4 h-12 w-12 text-accent"
            size={48}
            fill="currentColor"
          />
          <h2
            className="font-serif text-foreground transition-colors duration-700"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            Funny, cute & embarrassing moments
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            The moments we&apos;ll never forget (and maybe wish we could)
          </p>
          {canEdit && (
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Plus className="h-4 w-4" size={16} />
              Add image
            </button>
          )}
        </div>

        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto overflow-y-hidden pb-4 scroll-smooth snap-x snap-mandatory [-webkit-overflow-scrolling:touch]"
          aria-label="Funny and embarrassing moments carousel"
        >
          {displayItems.map((moment, index) => (
            <div
              key={moment.id}
              ref={(el) => {
                slideRefs.current[index] = el;
              }}
              className="flex w-[85vw] min-w-[280px] max-w-[360px] shrink-0 snap-center snap-always md:w-[45vw] lg:w-[32%]"
              style={{
                animation: `fadeIn 0.6s ease-out ${index * 0.03}s both`,
              }}
            >
              <div className="glass group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border">
                {canEdit && (
                  <div className="absolute right-2 top-2 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() =>
                        setEditOpen({
                          id: moment.id,
                          url: moment.url,
                          alt: moment.alt,
                          note: moment.note,
                        })
                      }
                      className="rounded-full bg-card/90 p-2 shadow hover:bg-accent hover:text-accent-foreground"
                      aria-label="Edit"
                    >
                      <PenLine className="h-4 w-4" size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(moment.id)}
                      className="rounded-full bg-card/90 p-2 shadow hover:bg-red-600 hover:text-white"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" size={16} />
                    </button>
                  </div>
                )}
                <div className="relative aspect-square w-full overflow-hidden">
                  <ImageWithFallback
                    src={moment.url}
                    alt={moment.alt}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                {(moment.note ?? moment.alt) && (
                  <div className="flex flex-col gap-1 p-4">
                    <p className="text-sm font-semibold text-foreground">
                      {moment.alt}
                    </p>
                    {moment.note && (
                      <p className="text-sm text-muted-foreground">
                        {moment.note}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={goPrev}
            className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            aria-label="Previous moment"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {displayItems.length}
          </span>
          <button
            type="button"
            onClick={goNext}
            className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            aria-label="Next moment"
          >
            Next
          </button>
        </div>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add image">
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
          <input
            type="text"
            name="alt"
            placeholder="Alt / title"
            className="rounded border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
          />
          <textarea
            name="note"
            placeholder="Note"
            rows={2}
            className="rounded border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAddOpen(false)}
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

      {editOpen && !editOpen.id.startsWith("fallback") && (
        <Modal
          open={!!editOpen}
          onClose={() => setEditOpen(null)}
          title="Edit image"
        >
          <EditForm
            initialAlt={editOpen.alt}
            initialNote={editOpen.note ?? ""}
            onSave={(alt, note) => handleEdit(editOpen.id, alt, note)}
            onCancel={() => setEditOpen(null)}
          />
        </Modal>
      )}

      {deleteId && !deleteId.startsWith("fallback") && (
        <Modal
          open={!!deleteId}
          onClose={() => setDeleteId(null)}
          title="Delete image?"
        >
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeleteId(null)}
              className="rounded-lg border border-border px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleDelete(deleteId)}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}

function EditForm({
  initialAlt,
  initialNote,
  onSave,
  onCancel,
}: {
  initialAlt: string;
  initialNote: string;
  onSave: (alt: string, note: string) => void;
  onCancel: () => void;
}) {
  const [alt, setAlt] = useState(initialAlt);
  const [note, setNote] = useState(initialNote);
  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        value={alt}
        onChange={(e) => setAlt(e.target.value)}
        placeholder="Alt / title"
        className="rounded border border-border bg-card px-3 py-2 text-sm text-foreground"
      />
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note"
        rows={2}
        className="rounded border border-border bg-card px-3 py-2 text-sm text-foreground"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border px-4 py-2 text-sm"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onSave(alt, note)}
          className="rounded-lg bg-accent px-4 py-2 text-sm text-accent-foreground"
        >
          Save
        </button>
      </div>
    </div>
  );
}
