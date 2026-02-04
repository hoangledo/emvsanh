"use client";

import { useEffect, useState } from "react";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { useAlbumImages } from "@/hooks/use-album-images";
import { useAuth } from "@/contexts/auth-context";
import { Heart, PenLine, Plus, Trash2 } from "@/components/icons";
import { Modal } from "@/components/ui/modal";
import {
  maxFilesPerUpload,
  maxFileSizeBytes,
  maxFileSizeMBDisplay,
} from "@/lib/upload-config";

const PHOTOS_PER_PAGE_MOBILE = 8;

type DisplayItem = { id: string; url: string; alt: string; note: string | null };

export function Hoang() {
  const { items, loading, refetch } = useAlbumImages("hoang");
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
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

  const totalPagesMobile = Math.ceil(
    displayItems.length / PHOTOS_PER_PAGE_MOBILE
  );
  const startMobile = (currentPage - 1) * PHOTOS_PER_PAGE_MOBILE;
  const pagePhotosMobile = displayItems.slice(
    startMobile,
    startMobile + PHOTOS_PER_PAGE_MOBILE
  );

  const closeModal = () => setActiveIndex(null);
  const showPrev = () => {
    setActiveIndex((current) => {
      if (current === null) return null;
      return (current - 1 + displayItems.length) % displayItems.length;
    });
  };
  const showNext = () => {
    setActiveIndex((current) => {
      if (current === null) return null;
      return (current + 1) % displayItems.length;
    });
  };

  useEffect(() => {
    if (activeIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
      else if (event.key === "ArrowLeft") showPrev();
      else if (event.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex]);

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
      fd.set("section", "hoang");
      fd.set("alt", alt);
      fd.set("note", note);
      fd.set("file", toUpload[i]);
      setUploadProgress({ current: i + 1, total: toUpload.length });
      const res = await fetch("/api/album/images", { method: "POST", body: fd });
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
      <section id="hoang" className="relative min-h-screen px-6 py-24">
        <div className="mx-auto max-w-7xl text-center text-muted-foreground">
          Loading…
        </div>
      </section>
    );
  }

  return (
    <section id="hoang" className="relative min-h-screen px-6 py-24">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute right-1/4 top-1/4 h-96 w-96 rounded-full blur-3xl bg-accent/40" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <Heart
            className="mx-auto mb-4 h-12 w-12 text-accent"
            size={48}
            fill="currentColor"
          />
          <h2
            className="font-serif text-foreground transition-colors duration-700"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            Our Days Together
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A flowing wall of little moments that still make my heart smile
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

        <div className="md:hidden">
          <div className="grid grid-cols-2 gap-4">
            {displayItems.length === 0 ? (
              <div className="col-span-full flex min-h-[60vh] items-center justify-center py-12">
                <p className="text-center text-muted-foreground">
                  No images yet. Add one above when logged in.
                </p>
              </div>
            ) : null}
            {pagePhotosMobile.map((photo, index) => {
              const globalIndex = startMobile + index;
              return (
                <div
                  key={photo.id}
                  className="group relative"
                  style={{
                    animation: `fadeIn 0.6s ease-out ${index * 0.05}s both`,
                  }}
                >
                  {canEdit && (
                    <div className="absolute right-2 top-2 z-10 flex gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditOpen({
                            id: photo.id,
                            url: photo.url,
                            alt: photo.alt,
                            note: photo.note,
                          });
                        }}
                        className="rounded-full bg-card/90 p-2 shadow hover:bg-accent hover:text-accent-foreground"
                        aria-label="Edit"
                      >
                        <PenLine className="h-4 w-4" size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(photo.id);
                        }}
                        className="rounded-full bg-card/90 p-2 shadow hover:bg-red-600 hover:text-white"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" size={16} />
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    onClick={() => setActiveIndex(globalIndex)}
                  >
                    <div className="relative aspect-square w-full overflow-hidden rounded-2xl">
                      <ImageWithFallback
                        src={photo.url}
                        alt={photo.alt}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 via-black/30 to-transparent px-3 pb-2 pt-8">
                        <p className="text-xs font-medium text-white/90">
                          {photo.alt}
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
          {displayItems.length > 0 && (
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
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPagesMobile, p + 1))
                }
                className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
              >
                Next page
              </button>
            </div>
          )}
        </div>

        <div className="hidden md:block">
          {displayItems.length === 0 ? (
            <div className="flex min-h-[60vh] items-center justify-center py-12">
              <p className="text-center text-muted-foreground">
                No images yet. Add one above when logged in.
              </p>
            </div>
          ) : (
            <div className="columns-1 gap-4 md:columns-2 lg:columns-3">
          {displayItems.map((photo, index) => (
            <div
              key={photo.id}
              className="group relative mb-4 inline-block w-full break-inside-avoid rounded-2xl text-left"
              style={{
                animation: `fadeIn 0.8s ease-out ${index * 0.05}s both`,
              }}
            >
              {canEdit && (
                <div className="absolute right-2 top-2 z-10 flex gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditOpen({
                        id: photo.id,
                        url: photo.url,
                        alt: photo.alt,
                        note: photo.note,
                      });
                    }}
                    className="rounded-full bg-card/90 p-2 shadow hover:bg-accent hover:text-accent-foreground"
                    aria-label="Edit"
                  >
                    <PenLine className="h-4 w-4" size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(photo.id);
                    }}
                    className="rounded-full bg-card/90 p-2 shadow hover:bg-red-600 hover:text-white"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" size={16} />
                  </button>
                </div>
              )}
              <button
                type="button"
                className="w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                onClick={() => setActiveIndex(index)}
              >
                <div className="relative w-full overflow-hidden rounded-2xl">
                  <ImageWithFallback
                    src={photo.url}
                    alt={photo.alt}
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 via-black/30 to-transparent px-4 pb-3 pt-10">
                    <p className="text-sm font-medium text-white/90">
                      {photo.alt}
                    </p>
                  </div>
                </div>
              </button>
            </div>
          ))}
            </div>
          )}
        </div>
      </div>

      {activeIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-xl">
          <div className="glass relative mx-4 max-h-[90vh] w-full max-w-3xl rounded-3xl border border-border p-4 shadow-2xl md:p-6">
            <div className="flex items-center justify-between pb-3">
              <p className="text-sm font-medium text-muted-foreground md:text-base">
                Together moments ({activeIndex + 1}/{displayItems.length})
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
                  src={displayItems[activeIndex].url}
                  alt={displayItems[activeIndex].alt}
                  className="mx-auto max-h-[60vh] w-full object-contain"
                />
              </div>

              <div
                className="space-y-2 text-center"
                style={{
                  fontFamily:
                    "var(--font-serif), system-ui, -apple-system, BlinkMacSystemFont",
                }}
              >
                <p className="text-base font-semibold text-white md:text-lg">
                  {displayItems[activeIndex].alt}
                </p>
                {displayItems[activeIndex].note && (
                  <p className="text-sm text-white/80 md:text-base">
                    {displayItems[activeIndex].note}
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

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add image">
        <form
          className="flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            await handleAdd(new FormData(e.currentTarget));
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
            onSave={(alt, note) => handleEdit(editOpen.id, alt, note)}
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
