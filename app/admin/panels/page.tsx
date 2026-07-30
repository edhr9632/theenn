"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { AdminBadge, AdminPageHeader, AdminTable } from "@/components/admin/AdminUi";
import { AdminRowActions } from "@/components/admin/AdminRowActions";

type PanelAdminItem = {
  id: string;
  title: string;
  topic: string;
  duration: string;
  speakers: string;
  image: string;
  youtube: string;
  sortOrder: number;
};

const MAX_THUMB_EDGE = 1280;
const THUMB_QUALITY = 0.88;

export default function AdminPanelsPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<PanelAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("");
  const [speakers, setSpeakers] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadItems = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/panels");
      const data = (await response.json()) as { items?: PanelAdminItem[] };
      if (!response.ok) {
        setItems([]);
        return;
      }
      setItems(data.items ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadItems();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setTopic("");
    setDuration("");
    setSpeakers("");
    setYoutubeUrl("");
    setImageUrl("");
    setSortOrder("0");
    if (fileRef.current) fileRef.current.value = "";
  };

  const flash = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2400);
  };

  const startEdit = (item: PanelAdminItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setTopic(item.topic);
    setDuration(item.duration);
    setSpeakers(item.speakers);
    setYoutubeUrl(item.youtube);
    setImageUrl(item.image);
    setSortOrder(String(item.sortOrder ?? 0));
    if (fileRef.current) fileRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onThumbFile = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      window.alert("Please upload an image file.");
      return;
    }
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_THUMB_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      window.alert("Could not process image.");
      return;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    setImageUrl(canvas.toDataURL("image/jpeg", THUMB_QUALITY));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !youtubeUrl.trim()) return;

    setSaving(true);
    const payload = {
      title: title.trim(),
      topic: topic.trim(),
      duration: duration.trim(),
      speakers: speakers.trim(),
      youtubeUrl: youtubeUrl.trim(),
      imageUrl: imageUrl.trim(),
      sortOrder: Number(sortOrder) || 0,
    };

    try {
      const url = editingId ? `/api/admin/panels/${encodeURIComponent(editingId)}` : "/api/admin/panels";
      const method = editingId ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        window.alert(data.error ?? "Could not save panel discussion.");
        return;
      }
      flash(editingId ? "Panel updated" : "Panel added");
      resetForm();
      await loadItems();
    } catch {
      window.alert("Could not save panel discussion.");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!window.confirm("Delete this panel discussion?")) return;
    try {
      const response = await fetch(`/api/admin/panels/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        window.alert(data.error ?? "Could not delete panel discussion.");
        return;
      }
      if (editingId === id) resetForm();
      flash("Panel deleted");
      await loadItems();
    } catch {
      window.alert("Could not delete panel discussion.");
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Panel Discussions"
        description="YouTube panel carousel cards shown on the homepage."
      />
      {message ? <p className="admin-flash mb-3">{message}</p> : null}

      <div className="admin-panel mb-4">
        <h2 className="h6 mb-3">{editingId ? "Edit panel discussion" : "Add panel discussion"}</h2>
        <form className="admin-form-grid" onSubmit={onSubmit}>
          <label className="admin-field-label admin-field-span">
            Title
            <input className="admin-field" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <label className="admin-field-label">
            Topic
            <input className="admin-field" value={topic} onChange={(e) => setTopic(e.target.value)} />
          </label>
          <label className="admin-field-label">
            Duration
            <input className="admin-field" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="48:12" />
          </label>
          <label className="admin-field-label admin-field-span">
            Speakers text
            <input className="admin-field" value={speakers} onChange={(e) => setSpeakers(e.target.value)} />
          </label>
          <label className="admin-field-label admin-field-span">
            YouTube URL
            <input
              className="admin-field"
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              required
            />
          </label>
          <label className="admin-field-label">
            Sort order
            <input className="admin-field" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
          </label>
          <div className="admin-field-label admin-field-span">
            <span className="d-block mb-2">Thumbnail upload</span>
            <div className="d-flex flex-wrap align-items-start gap-3">
              <div className="border rounded overflow-hidden bg-light flex-shrink-0" style={{ width: 160, height: 90 }}>
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt="" className="w-100 h-100" style={{ objectFit: "cover" }} />
                ) : (
                  <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted small text-center px-2">
                    No thumbnail
                  </div>
                )}
              </div>
              <div className="d-flex flex-column gap-2">
                <button type="button" className="btn admin-btn-primary btn-sm" onClick={() => fileRef.current?.click()}>
                  Upload thumbnail
                </button>
                {imageUrl ? (
                  <button
                    type="button"
                    className="btn admin-btn-ghost btn-sm"
                    onClick={() => {
                      setImageUrl("");
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="d-none"
              onChange={(e) => {
                void onThumbFile(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />
          </div>
          <div className="admin-field-span d-flex flex-wrap gap-2">
            <button type="submit" className="btn admin-btn-primary" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update panel" : "Add panel"}
            </button>
            {editingId ? (
              <button type="button" className="btn admin-btn-ghost" onClick={resetForm}>
                Cancel edit
              </button>
            ) : null}
          </div>
        </form>
      </div>

      <div className="admin-panel">
        <AdminTable columns={["Thumb", "Title", "Topic", "Duration", "YouTube", "Actions"]}>
          {loading ? (
            <tr>
              <td colSpan={6}>
                <p className="mb-0 text-muted py-3">Loading panels...</p>
              </td>
            </tr>
          ) : items.length ? (
            items.map((panel) => (
              <tr key={panel.id}>
                <td>
                  {panel.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={panel.image} alt="" width={52} height={30} className="rounded" style={{ objectFit: "cover" }} />
                  ) : (
                    "—"
                  )}
                </td>
              <td>
                <p className="admin-cell-title mb-0">{panel.title}</p>
                <p className="admin-cell-sub mb-0">{panel.speakers}</p>
              </td>
              <td>
                <AdminBadge>{panel.topic}</AdminBadge>
              </td>
              <td>{panel.duration}</td>
              <td>
                <a href={panel.youtube} target="_blank" rel="noopener noreferrer" className="admin-link-btn">
                  Open
                </a>
              </td>
              <td>
                <AdminRowActions onEdit={() => startEdit(panel)} onDelete={() => void onDelete(panel.id)} />
              </td>
            </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6}>
                <p className="mb-0 text-muted py-3">No panel discussions yet.</p>
              </td>
            </tr>
          )}
        </AdminTable>
      </div>
    </div>
  );
}
