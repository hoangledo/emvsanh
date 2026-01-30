"use client";

import { useState } from "react";
import { ImageIcon, PenLine, Plus, Trash2 } from "@/components/icons";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { useAlbumImages } from "@/hooks/use-album-images";
import { useAuth } from "@/contexts/auth-context";
import { Modal } from "@/components/ui/modal";
import { galleryImages } from "@/data/gallery";

type DisplayItem = { id: string; url: string; alt: string };

export function Gallery() {
  const { items, loading, refetch } = useAlbumImages("gallery");
  const { isAuthenticated } = useAuth();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState<DisplayItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fallback: DisplayItem[] = galleryImages.map((img, i) => ({
    id: `fallback-${i}`,
    url: img.url,
    alt: img.alt,
  }));
  const displayItems: DisplayItem[] =
    items.length > 0
      ? items.map((r) => ({ id: r.id, url: r.url, alt: r.alt }))
      : fallback;
  const canEdit = isAuthenticated;

  async function handleAdd(formData: FormData) {
    const file = formData.get("file") as File | null;
    if (!file?.size) return;
    const fd = new FormData();
    fd.set("section", "gallery");
    fd.set("alt", (formData.get("alt") as string) ?? "");
    fd.set("note", "");
    fd.set("file", file);
    const res = await fetch("/api/album/images", { method: "POST", body: fd });
    if (res.ok) {
      setAddOpen(false);
      refetch();
    }
  }

  async function handleEdit(id: string, alt: string) {
    const res = await fetch(`/api/album/images/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alt }),
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
      <section id="gallery" className="relative min-h-screen px-6 py-24">
        <div className="mx-auto max-w-7xl text-center text-muted-foreground">
          Loading…
        </div>
      </section>
    );
  }

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

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
          {displayItems.map((image, index) => (
            <div
              key={image.id}
              className="group relative aspect-square overflow-hidden rounded-2xl"
              style={{
                animation: `fadeIn 0.8s ease-out ${index * 0.15}s both`,
              }}
            >
              {canEdit && (
                <div className="absolute right-2 top-2 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() =>
                      setEditOpen({
                        id: image.id,
                        url: image.url,
                        alt: image.alt,
                      })
                    }
                    className="rounded-full bg-card/90 p-2 shadow hover:bg-accent hover:text-accent-foreground"
                    aria-label="Edit"
                  >
                    <PenLine className="h-4 w-4" size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(image.id)}
                    className="rounded-full bg-card/90 p-2 shadow hover:bg-red-600 hover:text-white"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" size={16} />
                  </button>
                </div>
              )}
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
            onSave={(alt) => handleEdit(editOpen.id, alt)}
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
  onSave,
  onCancel,
}: {
  initialAlt: string;
  onSave: (alt: string) => void;
  onCancel: () => void;
}) {
  const [alt, setAlt] = useState(initialAlt);
  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        value={alt}
        onChange={(e) => setAlt(e.target.value)}
        placeholder="Alt / title"
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
          onClick={() => onSave(alt)}
          className="rounded-lg bg-accent px-4 py-2 text-sm text-accent-foreground"
        >
          Save
        </button>
      </div>
    </div>
  );
}
