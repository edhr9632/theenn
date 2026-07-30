"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { AdminBadge, AdminPageHeader, AdminTable } from "@/components/admin/AdminUi";
import { AdminRowActions } from "@/components/admin/AdminRowActions";
import { youtubeThumb } from "@/lib/siteVideos";
import type { ShortVideo } from "@/lib/shortTypes";

const MAX_THUMB_EDGE = 720;
const THUMB_QUALITY = 0.85;

async function fileToCompressedDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file (JPG, PNG, or WebP).");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Image must be under 8 MB.");
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_THUMB_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      // Fallback without compression.
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.onerror = () => reject(new Error("Could not read image."));
        reader.readAsDataURL(file);
      });
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    return canvas.toDataURL("image/jpeg", THUMB_QUALITY);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function AdminShortsPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<ShortVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [duration, setDuration] = useState("0:45");
  const [meta, setMeta] = useState("Short");
  const [sortOrder, setSortOrder] = useState("0");
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadItems = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/shorts");
      const data = (await response.json()) as { items?: ShortVideo[]; error?: string };
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

  const flash = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2200);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setYoutubeUrl("");
    setImageUrl("");
    setDuration("0:45");
    setMeta("Short");
    setSortOrder("0");
    setEnabled(true);
    if (fileRef.current) fileRef.current.value = "";
  };

  const startEdit = (item: ShortVideo) => {
    setEditingId(item.id);
    setTitle(item.title);
    setYoutubeUrl(item.youtubeUrl);
    setImageUrl(item.image);
    setDuration(item.duration || "0:45");
    setMeta(item.meta || "Short");
    setSortOrder(String(item.sortOrder ?? 0));
    setEnabled(item.enabled);
    if (fileRef.current) fileRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onThumbFile = async (file: File | null) => {
    if (!file) return;
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      setImageUrl(dataUrl);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Could not read image.");
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanUrl = youtubeUrl.trim();
    if (!cleanTitle || !cleanUrl) return;

    setSaving(true);
    const payload = {
      title: cleanTitle,
      youtubeUrl: cleanUrl,
      imageUrl: imageUrl.trim() || youtubeThumb(cleanUrl),
      duration: duration.trim(),
      meta: meta.trim(),
      sortOrder: Number(sortOrder) || 0,
      enabled,
    };

    try {
      const url = editingId ? `/api/admin/shorts/${encodeURIComponent(editingId)}` : "/api/admin/shorts";
      const method = editingId ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        window.alert(data.error ?? "Could not save short video.");
        return;
      }
      flash(editingId ? "Short updated" : "Short added");
      resetForm();
      await loadItems();
    } catch {
      window.alert("Network error. Could not save short video.");
    } finally {
      setSaving(false);
    }
  };

  const removeItem = async (id: string) => {
    if (!window.confirm("Delete this short video?")) return;
    try {
      const response = await fetch(`/api/admin/shorts/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!response.ok) {
        window.alert("Could not delete short video.");
        return;
      }
      if (editingId === id) resetForm();
      flash("Short deleted");
      await loadItems();
    } catch {
      window.alert("Network error while deleting.");
    }
  };

  const previewSrc = imageUrl.trim() || (youtubeUrl.trim() ? youtubeThumb(youtubeUrl.trim()) : "");

  return (
    <div>
      <AdminPageHeader
        title="Short Videos"
        description="Vertical short clips shown in the Short Videos section on the homepage. Saved to PostgreSQL."
      />

      {message ? <p className="admin-flash mb-3">{message}</p> : null}

      <div className="admin-panel mb-4">
        <h2 className="h6 mb-3">{editingId ? "Edit short video" : "Add short video"}</h2>
        <form className="admin-form-grid" onSubmit={onSubmit}>
          <label className="admin-field-label admin-field-span">
            Title
            <input
              className="admin-field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short video title"
              required
            />
          </label>
          <label className="admin-field-label admin-field-span">
            YouTube / Shorts URL
            <input
              className="admin-field"
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/shorts/… or watch?v=…"
              required
            />
          </label>
          <label className="admin-field-label">
            Duration
            <input
              className="admin-field"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="0:45"
            />
          </label>
          <label className="admin-field-label">
            Meta / tag
            <input
              className="admin-field"
              value={meta}
              onChange={(e) => setMeta(e.target.value)}
              placeholder="K-12, Exam, Campus…"
            />
          </label>
          <label className="admin-field-label">
            Sort order
            <input
              className="admin-field"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
          </label>
          <label className="admin-field-label admin-check-row">
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
            Show on homepage
          </label>

          <div className="admin-field-label admin-field-span">
            <span className="d-block mb-2">Thumbnail image</span>
            <div className="d-flex flex-wrap align-items-start gap-3">
              <div
                className="border rounded overflow-hidden bg-light flex-shrink-0"
                style={{ width: 120, height: 180 }}
              >
                {previewSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewSrc} alt="" className="w-100 h-100" style={{ objectFit: "cover" }} />
                ) : (
                  <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted small px-2 text-center">
                    No thumbnail
                  </div>
                )}
              </div>
              <div className="d-flex flex-column gap-2">
                <button
                  type="button"
                  className="btn admin-btn-primary btn-sm"
                  onClick={() => fileRef.current?.click()}
                >
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
                    Use YouTube thumbnail
                  </button>
                ) : null}
                <span className="small text-muted">JPG/PNG/WebP. Optional — auto from YouTube if empty.</span>
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
              {saving ? "Saving…" : editingId ? "Update short" : "Add short"}
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
        <AdminTable columns={["Thumb", "Title", "Meta", "Duration", "Status", "YouTube", "Actions"]}>
          {loading ? (
            <tr>
              <td colSpan={7}>
                <p className="mb-0 text-muted py-3">Loading shorts…</p>
              </td>
            </tr>
          ) : items.length ? (
            items.map((item) => (
              <tr key={item.id}>
                <td>
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt=""
                      width={40}
                      height={60}
                      className="rounded"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  <p className="admin-cell-title mb-0">{item.title}</p>
                  <p className="admin-cell-sub mb-0">Order {item.sortOrder}</p>
                </td>
                <td>
                  <AdminBadge>{item.meta || "Short"}</AdminBadge>
                </td>
                <td>{item.duration || "—"}</td>
                <td>
                  <AdminBadge tone={item.enabled ? "green" : "gray"}>
                    {item.enabled ? "Live" : "Hidden"}
                  </AdminBadge>
                </td>
                <td>
                  <a href={item.youtubeUrl} target="_blank" rel="noopener noreferrer" className="admin-link-btn">
                    Open
                  </a>
                </td>
                <td>
                  <AdminRowActions onEdit={() => startEdit(item)} onDelete={() => void removeItem(item.id)} />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7}>
                <p className="mb-0 text-muted py-3">
                  No shorts yet. Add a YouTube Shorts URL above to show them on the homepage.
                </p>
              </td>
            </tr>
          )}
        </AdminTable>
      </div>
    </div>
  );
}
