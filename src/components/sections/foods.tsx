"use client";

import { useEffect, useRef, useState } from "react";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { useAlbumImages } from "@/hooks/use-album-images";
import { useAuth } from "@/contexts/auth-context";
import { ChevronLeft, ChevronRight, Heart, PenLine, Plus, Trash2 } from "@/components/icons";
import { Modal } from "@/components/ui/modal";
import {
  maxFilesPerUpload,
  maxFileSizeBytes,
  maxFileSizeMBDisplay,
} from "@/lib/upload-config";

type DisplayItem = { id: string; url: string; alt: string; note: string | null };

export function Foods() {
  const { items, loading, refetch } = useAlbumImages("foods");
  const { isAuthenticated } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState<DisplayItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const displayItems: DisplayItem[] = items.map((r) => ({
    id: r.id,
    url: r.url,
    alt: r.alt,
    note: r.note,
  }));
  const canEdit = isAuthenticated;

  const isFirstScrollRef = useRef(true);
  useEffect(() => {
    const el = slideRefs.current[currentIndex];
    if (!el) return;
    if (isFirstScrollRef.current) {
      isFirstScrollRef.current = false;
      return;
    }
    el.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [currentIndex]);

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
    const raw = formData.getAll("file");
    const files = (raw.length ? raw : [formData.get("file")]).filter(
      (f): f is File => f instanceof File && f.size > 0
    );
    if (files.length === 0) return;
    const toUpload = files
      .filter((f) => f.size <= maxFileSizeBytes)
      .slice(0, maxFilesPerUpload);
    const skipped = files.length - toUpload.length;
    if (toUpload.length === 0) {
      setAddError(
        skipped > 0
          ? `All files exceed ${maxFileSizeMBDisplay} MB or max ${maxFilesPerUpload} photos.`
          : "No valid files."
      );
      return;
    }
    setAddError(null);
    setUploadProgress({ current: 0, total: toUpload.length });
    const alt = (formData.get("alt") as string) ?? "";
    const note = (formData.get("note") as string) ?? "";
    let ok = true;
    for (let i = 0; i < toUpload.length; i++) {
      const fd = new FormData();
      fd.set("section", "foods");
      fd.set("alt", alt);
      fd.set("note", note);
      fd.set("file", toUpload[i]);
      setUploadProgress({ current: i + 1, total: toUpload.length });
      const res = await fetch("/api/album/images", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        ok = false;
        const data = await res.json().catch(() => ({}));
        setAddError(data?.error ?? "Upload failed");
        break;
      }
    }
    setUploadProgress(null);
    if (ok) {
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

  if (loading) {
    return (
      <section id="foods" className="relative min-h-screen px-6 py-24">
        <div className="mx-auto max-w-7xl text-center text-muted-foreground">
          Loading…
        </div>
      </section>
    );
  }

  return (
    <section id="foods" className="relative min-h-screen overflow-x-hidden px-6 py-24">
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
            Fooooooods
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A little carousel of our shared meals and moments at the table
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
          className="scrollbar-hide flex gap-6 overflow-x-auto overflow-y-hidden pb-4 scroll-smooth snap-x snap-mandatory [-webkit-overflow-scrolling:touch]"
          aria-label="Food photos carousel"
        >
          {displayItems.length === 0 ? (
            <p className="w-full py-12 text-center text-muted-foreground">
              No images yet. Add one above when logged in.
            </p>
          ) : null}
          {displayItems.map((photo, index) => (
            <div
              key={photo.id}
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
                  <div className="absolute right-2 top-2 z-10 flex gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() =>
                        setEditOpen({
                          id: photo.id,
                          url: photo.url,
                          alt: photo.alt,
                          note: photo.note,
                        })
                      }
                      className="rounded-full bg-card/90 p-2 shadow hover:bg-accent hover:text-accent-foreground"
                      aria-label="Edit"
                    >
                      <PenLine className="h-4 w-4" size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(photo.id)}
                      className="rounded-full bg-card/90 p-2 shadow hover:bg-red-600 hover:text-white"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" size={16} />
                    </button>
                  </div>
                )}
                <div className="relative aspect-square w-full overflow-hidden">
                  <ImageWithFallback
                    src={photo.url}
                    alt={photo.alt}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-col gap-1 p-4">
                  <p className="text-sm font-semibold text-foreground">
                    {photo.alt}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {photo.note ?? ""}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {displayItems.length > 0 && (
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => {
                const prev =
                  (currentIndex - 1 + displayItems.length) % displayItems.length;
                setCurrentIndex(prev);
                slideRefs.current[prev]?.scrollIntoView({
                  behavior: "smooth",
                  inline: "center",
                  block: "nearest",
                });
              }}
              className="rounded-full border border-border bg-card p-2 text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label="Previous food photo"
            >
              <ChevronLeft className="h-5 w-5" size={20} />
            </button>
            <div className="flex items-center justify-center gap-2">
              {(() => {
                const maxDots = 5;
                const total = displayItems.length;
                const dotIndices =
                  total <= maxDots
                    ? Array.from({ length: total }, (_, i) => i)
                    : Array.from(
                        { length: maxDots },
                        (_, i) =>
                          Math.min(
                            Math.max(0, currentIndex - 2),
                            total - maxDots
                          ) + i
                      );
                return dotIndices.map((index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setCurrentIndex(index);
                      slideRefs.current[index]?.scrollIntoView({
                        behavior: "smooth",
                        inline: "center",
                        block: "nearest",
                      });
                    }}
                    className={`h-2.5 w-2.5 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                      index === currentIndex
                        ? "bg-accent scale-125"
                        : "bg-muted-foreground/40 hover:bg-muted-foreground/60"
                    }`}
                    aria-label={`Go to food photo ${index + 1} of ${displayItems.length}`}
                    aria-current={index === currentIndex ? "true" : undefined}
                  />
                ));
              })()}
            </div>
            <button
              type="button"
              onClick={() => {
                const next = (currentIndex + 1) % displayItems.length;
                setCurrentIndex(next);
                slideRefs.current[next]?.scrollIntoView({
                  behavior: "smooth",
                  inline: "center",
                  block: "nearest",
                });
              }}
              className="rounded-full border border-border bg-card p-2 text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label="Next food photo"
            >
              <ChevronRight className="h-5 w-5" size={20} />
            </button>
          </div>
        )}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add image">
        <form
          className="flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const fd = new FormData(form);
            await handleAdd(fd);
          }}
        >
          <p className="text-xs text-muted-foreground">
            Max {maxFilesPerUpload} photos, {maxFileSizeMBDisplay} MB each.
          </p>
          <input
            type="file"
            name="file"
            accept="image/*"
            multiple
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
          {uploadProgress && (
            <p className="text-sm text-muted-foreground">
              Uploading {uploadProgress.current} of {uploadProgress.total}…
            </p>
          )}
          {addError && (
            <p className="text-sm text-red-600 dark:text-red-400">{addError}</p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAddOpen(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm"
              disabled={!!uploadProgress}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-accent px-4 py-2 text-sm text-accent-foreground disabled:opacity-50"
              disabled={!!uploadProgress}
            >
              {uploadProgress ? "Uploading…" : "Add"}
            </button>
          </div>
        </form>
      </Modal>

      {editOpen && (
        <Modal
          open={!!editOpen}
          onClose={() => setEditOpen(null)}
          title="Edit image"
        >
          <EditForm
            initialAlt={editOpen.alt}
            initialNote={editOpen.note ?? ""}
            onSave={(alt, note) =>
              handleEdit(editOpen.id, alt, note)
            }
            onCancel={() => setEditOpen(null)}
          />
        </Modal>
      )}

      {deleteId && (
        <Modal
          open={!!deleteId}
          onClose={() => setDeleteId(null)}
          title="Delete image?"
        >
          <div className="flex gap-2 justify-end">
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
