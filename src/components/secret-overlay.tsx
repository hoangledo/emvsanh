"use client";

import { useRef, useState } from "react";
import { ImageIcon, PenLine, Plus, Trash2 } from "@/components/icons";
import { useSecretMode } from "@/contexts/secret-mode-context";
import { useSecretFeed } from "@/hooks/use-secret-feed";
import { useSecretNotes } from "@/hooks/use-secret-notes";
import { useSecretPhotos } from "@/hooks/use-secret-photos";
import type { SecretNote } from "@/hooks/use-secret-notes";
import type { SecretPhoto } from "@/hooks/use-secret-photos";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { maxFileSizeMBDisplay } from "@/lib/upload-config";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SecretNoteCard({
  note,
  onRefetch,
}: {
  note: SecretNote;
  onRefetch: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSave() {
    if (editContent.trim() === note.content) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/secret/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent.trim() }),
      });
      if (res.ok) {
        setEditing(false);
        onRefetch();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this note?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/secret/notes/${note.id}`, {
        method: "DELETE",
      });
      if (res.ok) onRefetch();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <article className="glass rounded-2xl border border-border p-4 shadow-lg transition-all duration-300 hover:shadow-xl">
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          {formatDate(note.updated_at)}
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            aria-label="Edit note"
          >
            <PenLine className="h-4 w-4" size={16} />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-500/20 hover:text-red-500 disabled:opacity-50"
            aria-label="Delete note"
          >
            <Trash2 className="h-4 w-4" size={16} />
          </button>
        </div>
      </div>
      {editing ? (
        <div className="space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-[100px] w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            placeholder="Your note…"
            disabled={saving}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setEditContent(note.content);
                setEditing(false);
              }}
              className="rounded-xl border border-border px-3 py-1.5 text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !editContent.trim()}
              className="rounded-xl bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <p className="whitespace-pre-wrap text-card-foreground">{note.content}</p>
      )}
    </article>
  );
}

function SecretPhotoCard({
  photo,
  onRefetch,
}: {
  photo: SecretPhoto;
  onRefetch: () => void;
}) {
  const [editingCaption, setEditingCaption] = useState(false);
  const [caption, setCaption] = useState(photo.caption ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSaveCaption() {
    setSaving(true);
    try {
      const res = await fetch(`/api/secret/photos/${photo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption: caption.trim() || null }),
      });
      if (res.ok) {
        setEditingCaption(false);
        onRefetch();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this photo?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/secret/photos/${photo.id}`, {
        method: "DELETE",
      });
      if (res.ok) onRefetch();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <article className="glass overflow-hidden rounded-2xl border border-border shadow-lg transition-all duration-300 hover:shadow-xl">
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {photo.url ? (
          <ImageWithFallback
            src={photo.url}
            alt={photo.caption ?? "Secret photo"}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ImageIcon className="h-12 w-12" size={48} />
          </div>
        )}
        <div className="absolute right-2 top-2 flex gap-1">
          <button
            type="button"
            onClick={() => setEditingCaption(true)}
            className="rounded-lg bg-black/40 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
            aria-label="Edit caption"
          >
            <PenLine className="h-4 w-4" size={16} />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg bg-black/40 p-2 text-white backdrop-blur-sm transition-colors hover:bg-red-500/80 disabled:opacity-50"
            aria-label="Delete photo"
          >
            <Trash2 className="h-4 w-4" size={16} />
          </button>
        </div>
      </div>
      <div className="p-3">
        <span className="text-xs text-muted-foreground">
          {formatDate(photo.created_at)}
        </span>
        {editingCaption ? (
          <div className="mt-2 space-y-2">
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Caption…"
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              disabled={saving}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setCaption(photo.caption ?? "");
                  setEditingCaption(false);
                }}
                className="rounded-lg border border-border px-2 py-1 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCaption}
                disabled={saving}
                className="rounded-lg bg-accent px-2 py-1 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        ) : (
          (photo.caption ?? caption) && (
            <p className="mt-1 text-sm text-card-foreground">
              {photo.caption ?? caption}
            </p>
          )
        )}
      </div>
    </article>
  );
}

export function SecretOverlay() {
  const { secretModeActive, toggleSecretMode } = useSecretMode();
  const { notes, loading: notesLoading, refetch: refetchNotes } =
    useSecretNotes();
  const { photos, loading: photosLoading, refetch: refetchPhotos } =
    useSecretPhotos();
  const feed = useSecretFeed(notes, photos);
  const [newNoteOpen, setNewNoteOpen] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteSaving, setNewNoteSaving] = useState(false);
  const [addPhotoOpen, setAddPhotoOpen] = useState(false);
  const [addPhotoFile, setAddPhotoFile] = useState<File | null>(null);
  const [addPhotoCaption, setAddPhotoCaption] = useState("");
  const [addPhotoUploading, setAddPhotoUploading] = useState(false);
  const [addPhotoError, setAddPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loading = notesLoading || photosLoading;

  function handleRefetch() {
    refetchNotes();
    refetchPhotos();
  }

  async function handleNewNoteSubmit(e: React.FormEvent) {
    e.preventDefault();
    const content = newNoteContent.trim();
    if (!content) return;
    setNewNoteSaving(true);
    try {
      const res = await fetch("/api/secret/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        setNewNoteContent("");
        setNewNoteOpen(false);
        handleRefetch();
      }
    } finally {
      setNewNoteSaving(false);
    }
  }

  async function handleAddPhotoSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!addPhotoFile) return;
    setAddPhotoUploading(true);
    setAddPhotoError(null);
    try {
      const formData = new FormData();
      formData.set("file", addPhotoFile);
      if (addPhotoCaption.trim()) formData.set("caption", addPhotoCaption.trim());
      const res = await fetch("/api/secret/photos", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setAddPhotoFile(null);
        setAddPhotoCaption("");
        setAddPhotoOpen(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        handleRefetch();
      } else {
        setAddPhotoError(data?.error ?? "Upload failed.");
      }
    } finally {
      setAddPhotoUploading(false);
    }
  }

  if (!secretModeActive) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex flex-col bg-[var(--glass-bg)] shadow-[inset_0_0_0_1px_var(--glass-border)] backdrop-blur-xl transition-opacity duration-300">
        <div className="flex min-h-screen flex-1 flex-col overflow-hidden">
          <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6">
            <h1 className="font-serif text-xl font-medium text-foreground sm:text-2xl">
              Our secret place
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setNewNoteOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:opacity-90"
              >
                <Plus className="h-4 w-4" size={16} />
                New note
              </button>
              <button
                type="button"
                onClick={() => setAddPhotoOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:opacity-90"
              >
                <ImageIcon className="h-4 w-4" size={16} />
                Add photo
              </button>
              <button
                type="button"
                onClick={toggleSecretMode}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
              >
                Exit secret mode
              </button>
            </div>
          </header>
          <p className="shrink-0 px-4 py-1 text-xs text-muted-foreground sm:px-6">
            Cmd+S (Mac) or Ctrl+S (Windows) to exit
          </p>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            <div className="mx-auto max-w-2xl space-y-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-32 animate-pulse rounded-2xl bg-muted/50"
                    />
                  ))}
                </div>
              ) : feed.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
                  <PenLine className="mb-4 h-12 w-12 text-muted-foreground" size={48} />
                  <p className="text-lg font-medium text-foreground">
                    Nothing here yet
                  </p>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    Things we can or don&apos;t wanna say—add a note or a photo
                    when you&apos;re ready.
                  </p>
                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setNewNoteOpen(true)}
                      className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
                    >
                      New note
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddPhotoOpen(true)}
                      className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
                    >
                      Add photo
                    </button>
                  </div>
                </div>
              ) : (
                feed.map((item) => (
                  <div
                    key={item.id}
                    className="transition-all duration-300 ease-out"
                  >
                    {item.type === "note" ? (
                      <SecretNoteCard
                        note={item.note}
                        onRefetch={handleRefetch}
                      />
                    ) : (
                      <SecretPhotoCard
                        photo={item.photo}
                        onRefetch={handleRefetch}
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={newNoteOpen}
        onClose={() => {
          setNewNoteOpen(false);
          setNewNoteContent("");
        }}
        title="New note"
        zIndex={110}
      >
        <form onSubmit={handleNewNoteSubmit} className="flex flex-col gap-4">
          <textarea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder="Write what you can or don't wanna say…"
            className="min-h-[140px] w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            required
            disabled={newNoteSaving}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setNewNoteOpen(false)}
              className="rounded-xl border border-border px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={newNoteSaving || !newNoteContent.trim()}
              className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
            >
              {newNoteSaving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={addPhotoOpen}
        onClose={() => {
          setAddPhotoOpen(false);
          setAddPhotoFile(null);
          setAddPhotoCaption("");
          setAddPhotoError(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }}
        title="Add photo"
        zIndex={110}
      >
        <form onSubmit={handleAddPhotoSubmit} className="flex flex-col gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={(e) => {
              const f = e.target.files?.[0];
              setAddPhotoFile(f ?? null);
              setAddPhotoError(null);
            }}
            className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground file:mr-2 file:rounded-lg file:border-0 file:bg-accent file:px-3 file:py-1 file:text-accent-foreground"
          />
          <p className="text-xs text-muted-foreground">
            Max {maxFileSizeMBDisplay} MB. JPEG, PNG, GIF, WebP.
          </p>
          <input
            type="text"
            value={addPhotoCaption}
            onChange={(e) => setAddPhotoCaption(e.target.value)}
            placeholder="Caption (optional)"
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            disabled={addPhotoUploading}
          />
          {addPhotoError && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {addPhotoError}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAddPhotoOpen(false)}
              className="rounded-xl border border-border px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addPhotoUploading || !addPhotoFile}
              className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
            >
              {addPhotoUploading ? "Uploading…" : "Upload"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
