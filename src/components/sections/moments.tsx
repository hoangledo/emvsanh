"use client";

import { useState } from "react";
import { Calendar, PenLine, Plus, Trash2 } from "@/components/icons";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { useMoments } from "@/hooks/use-moments";
import { useAuth } from "@/contexts/auth-context";
import { Modal } from "@/components/ui/modal";

type DisplayMoment = {
  id: string;
  title: string;
  date: string;
  description: string;
  url: string;
};

export function Moments() {
  const { items, loading, refetch } = useMoments();
  const { isAuthenticated } = useAuth();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState<DisplayMoment | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const displayItems: DisplayMoment[] = items.map((r) => ({
    id: r.id,
    title: r.title,
    date: r.date,
    description: r.description,
    url: r.url,
  }));
  const canEdit = isAuthenticated;

  async function handleAdd(formData: FormData) {
    const file = formData.get("file") as File | null;
    if (!file?.size) return;
    const fd = new FormData();
    fd.set("title", (formData.get("title") as string) ?? "");
    fd.set("date", (formData.get("date") as string) ?? "");
    fd.set("description", (formData.get("description") as string) ?? "");
    fd.set("file", file);
    const res = await fetch("/api/album/moments", { method: "POST", body: fd });
    if (res.ok) {
      setAddOpen(false);
      refetch();
    }
  }

  async function handleEdit(
    id: string,
    title: string,
    date: string,
    description: string
  ) {
    const res = await fetch(`/api/album/moments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, date, description }),
    });
    if (res.ok) {
      setEditOpen(null);
      refetch();
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/album/moments/${id}`, { method: "DELETE" });
    if (res.ok) {
      setDeleteId(null);
      refetch();
    }
  }

  if (loading && items.length === 0) {
    return (
      <section id="moments" className="relative min-h-screen px-6 py-24">
        <div className="mx-auto max-w-7xl text-center text-muted-foreground">
          Loading…
        </div>
      </section>
    );
  }

  return (
    <section id="moments" className="relative min-h-screen px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <Calendar
            className="mx-auto mb-4 h-12 w-12 text-accent"
            size={48}
          />
          <h2
            className="font-serif text-foreground transition-colors duration-700"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            Our Moments
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A collection of memories that make my heart smile
          </p>
          {canEdit && (
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Plus className="h-4 w-4" size={16} />
              Add moment
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {displayItems.length === 0 ? (
            <div className="col-span-full flex min-h-[60vh] items-center justify-center py-12">
              <p className="text-center text-muted-foreground">
                No moments yet. Add one above when logged in.
              </p>
            </div>
          ) : null}
          {displayItems.map((moment, index) => (
            <div
              key={moment.id}
              className="group relative"
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
              }}
            >
              {canEdit && (
                <div className="absolute right-2 top-2 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() =>
                      setEditOpen({
                        id: moment.id,
                        title: moment.title,
                        date: moment.date,
                        description: moment.description,
                        url: moment.url,
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
              <div className="glass overflow-hidden rounded-2xl border border-border transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                <div className="relative h-64 overflow-hidden">
                  <ImageWithFallback
                    src={moment.url}
                    alt={moment.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                </div>

                <div className="p-6">
                  <h3 className="mb-2 font-serif text-foreground transition-colors duration-700">
                    {moment.title}
                  </h3>
                  <p className="mb-3 text-sm text-muted-foreground">
                    {moment.date}
                  </p>
                  <p className="text-sm leading-relaxed text-card-foreground">
                    {moment.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add moment"
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
          <input
            type="text"
            name="title"
            placeholder="Title"
            required
            className="rounded border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
          />
          <input
            type="text"
            name="date"
            placeholder="Date (e.g. Spring 2023)"
            required
            className="rounded border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
          />
          <textarea
            name="description"
            placeholder="Description"
            rows={3}
            required
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
          title="Edit moment"
        >
          <EditMomentForm
            initialTitle={editOpen.title}
            initialDate={editOpen.date}
            initialDescription={editOpen.description}
            onSave={(title, date, description) =>
              handleEdit(editOpen.id, title, date, description)
            }
            onCancel={() => setEditOpen(null)}
          />
        </Modal>
      )}

      {deleteId && (
        <Modal
          open={!!deleteId}
          onClose={() => setDeleteId(null)}
          title="Delete moment?"
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

function EditMomentForm({
  initialTitle,
  initialDate,
  initialDescription,
  onSave,
  onCancel,
}: {
  initialTitle: string;
  initialDate: string;
  initialDescription: string;
  onSave: (title: string, date: string, description: string) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [date, setDate] = useState(initialDate);
  const [description, setDescription] = useState(initialDescription);
  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="rounded border border-border bg-card px-3 py-2 text-sm text-foreground"
      />
      <input
        type="text"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        placeholder="Date"
        className="rounded border border-border bg-card px-3 py-2 text-sm text-foreground"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        rows={3}
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
          onClick={() => onSave(title, date, description)}
          className="rounded-lg bg-accent px-4 py-2 text-sm text-accent-foreground"
        >
          Save
        </button>
      </div>
    </div>
  );
}
