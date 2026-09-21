"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { AdminBadge, AdminPageHeader, AdminTable } from "@/components/admin/AdminUi";
import { AdminRowActions } from "@/components/admin/AdminRowActions";
import { EVENT_YEAR_OPTIONS, getDefaultEventCategory, getEventCategoriesForYear } from "@/lib/eventCategories";
import { uploadEventMediaAsset, uploadPressBitAsset } from "@/lib/eventMediaUpload";
import { youtubeThumb } from "@/lib/siteVideos";
import type { PressBit, PressBitSourceType } from "@/lib/pressBitTypes";

const YEAR_OPTIONS = [...EVENT_YEAR_OPTIONS];
const MAX_THUMB_EDGE = 720;
const THUMB_QUALITY = 0.85;

async function fileToCompressedDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file (JPG, PNG, or WebP).");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Image must be under 8 MB.");
  }

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
  } catch {
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(new Error("Could not read image."));
      reader.readAsDataURL(file);
    });
  }
}

export default function AdminPressBitsPage() {
  const thumbRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<PressBit[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [sourceType, setSourceType] = useState<PressBitSourceType>("youtube");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFileName, setVideoFileName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [year, setYear] = useState(String(YEAR_OPTIONS[0]));
  const [category, setCategory] = useState<string>(getDefaultEventCategory(YEAR_OPTIONS[0]));
  const [sortOrder, setSortOrder] = useState("0");
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadPercent, setUploadPercent] = useState<number | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const loadItems = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/press-bits");
      const data = (await response.json()) as { items?: PressBit[] };
      setItems(response.ok ? data.items ?? [] : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadItems();
    void import("@/lib/compressVideoForStorage").then((mod) => {
      mod.preloadVideoCompressor();
    });
  }, []);

  const flash = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2200);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setSourceType("youtube");
    setVideoUrl("");
    setVideoFileName("");
    setImageUrl("");
    setYear(String(YEAR_OPTIONS[0]));
    setCategory(getDefaultEventCategory(YEAR_OPTIONS[0]));
    setSortOrder("0");
    setEnabled(true);
    if (thumbRef.current) thumbRef.current.value = "";
    if (videoRef.current) videoRef.current.value = "";
  };

  const startEdit = (item: PressBit) => {
    setEditingId(item.id);
    setTitle(item.title);
    setSourceType(item.sourceType);
    setVideoUrl(item.videoUrl);
    setVideoFileName(item.sourceType === "upload" ? item.videoUrl.split("/").pop() || "Uploaded video" : "");
    setImageUrl(item.image);
    setYear(String(item.year));
    setCategory(
      getEventCategoriesForYear(item.year).includes(item.category)
        ? item.category
        : getDefaultEventCategory(item.year),
    );
    setSortOrder(String(item.sortOrder ?? 0));
    setEnabled(item.enabled);
    if (thumbRef.current) thumbRef.current.value = "";
    if (videoRef.current) videoRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onThumbFile = async (file: File | null) => {
    if (!file) return;
    try {
      // Prefer storage upload so we don't store huge data URLs in Postgres
      try {
        const publicUrl = await uploadPressBitAsset(file, "thumbs", title || "press-bit");
        setImageUrl(publicUrl);
      } catch {
        setImageUrl(await fileToCompressedDataUrl(file));
      }
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Could not read image.");
    }
  };

  const onVideoFile = async (file: File | null) => {
    if (!file) return;
    setUploadingVideo(true);
    setUploadPercent(0);
    setUploadStatus("Preparing video…");
    try {
      const publicUrl = await uploadEventMediaAsset(file, "videos", title || "press-bit", {
        onProgress: setUploadPercent,
        onStatus: setUploadStatus,
      });
      setVideoUrl(publicUrl);
      setVideoFileName(file.name);
      setSourceType("upload");
      flash("Video uploaded");
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Could not upload video.");
    } finally {
      setUploadingVideo(false);
      setUploadPercent(null);
      setUploadStatus("");
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanVideo = videoUrl.trim();
    if (!cleanTitle || !cleanVideo) {
      window.alert("Title and a YouTube/Shorts URL or uploaded video are required.");
      return;
    }

    setSaving(true);
    const resolvedSource: PressBitSourceType =
      sourceType === "upload" || !/youtube\.com|youtu\.be/i.test(cleanVideo) ? "upload" : "youtube";
    const payload = {
      title: cleanTitle,
      videoUrl: cleanVideo,
      sourceType: resolvedSource,
      imageUrl:
        imageUrl.trim() ||
        (resolvedSource === "youtube" ? youtubeThumb(cleanVideo) : ""),
      year: Number(year),
      category: category.trim(),
      sortOrder: Number(sortOrder) || 0,
      enabled,
    };

    try {
      const url = editingId ? `/api/admin/press-bits/${encodeURIComponent(editingId)}` : "/api/admin/press-bits";
      const method = editingId ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        window.alert(data.error ?? "Could not save press bit.");
        return;
      }
      flash(editingId ? "Press bit updated" : "Press bit added");
      resetForm();
      await loadItems();
    } catch {
      window.alert("Network error. Could not save press bit.");
    } finally {
      setSaving(false);
    }
  };

  const removeItem = async (id: string) => {
    if (!window.confirm("Delete this press bit?")) return;
    try {
      const response = await fetch(`/api/admin/press-bits/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!response.ok) {
        window.alert("Could not delete press bit.");
        return;
      }
      if (editingId === id) resetForm();
      flash("Press bit deleted");
      await loadItems();
    } catch {
      window.alert("Network error while deleting.");
    }
  };

  const previewSrc =
    imageUrl.trim() ||
    (sourceType === "youtube" && videoUrl.trim() ? youtubeThumb(videoUrl.trim()) : "");

  return (
    <div>
      <AdminPageHeader
        title="Press Bits"
        description="Event reel videos for Events → Press Bits. Add a YouTube/Shorts URL or upload a video file. Filterable by year and category."
      />

      {message ? <p className="admin-flash mb-3">{message}</p> : null}

      <div className="admin-panel mb-4">
        <h2 className="h6 mb-3">{editingId ? "Edit press bit" : "Add press bit"}</h2>
        <form className="admin-form-grid" onSubmit={onSubmit}>
          <label className="admin-field-label admin-field-span">
            Title
            <input
              className="admin-field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Reel / press bit title"
              required
            />
          </label>

          <div className="admin-field-label admin-field-span">
            <span className="d-block mb-2">Video source</span>
            <div className="d-flex flex-wrap gap-3 mb-3">
              <label className="admin-check-row mb-0">
                <input
                  type="radio"
                  name="press-bit-source"
                  checked={sourceType === "youtube"}
                  onChange={() => {
                    setSourceType("youtube");
                    setVideoFileName("");
                    if (videoRef.current) videoRef.current.value = "";
                  }}
                />
                YouTube / Shorts URL
              </label>
              <label className="admin-check-row mb-0">
                <input
                  type="radio"
                  name="press-bit-source"
                  checked={sourceType === "upload"}
                  onChange={() => setSourceType("upload")}
                />
                Upload video file
              </label>
            </div>

            {sourceType === "youtube" ? (
              <input
                className="admin-field"
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/shorts/… or watch?v=…"
                required={sourceType === "youtube"}
              />
            ) : (
              <div className="d-flex flex-column gap-2">
                <div className="d-flex flex-wrap align-items-center gap-2">
                  <button
                    type="button"
                    className="btn admin-btn-primary btn-sm"
                    disabled={uploadingVideo}
                    onClick={() => videoRef.current?.click()}
                  >
                    {uploadingVideo
                      ? `Working…${uploadPercent != null ? ` ${uploadPercent}%` : ""}`
                      : "Choose video file"}
                  </button>
                  {videoUrl ? (
                    <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="admin-link-btn">
                      Preview uploaded video
                    </a>
                  ) : null}
                </div>
                <span className="small text-muted">
                  {uploadingVideo && uploadStatus
                    ? uploadStatus
                    : videoFileName
                      ? `Selected: ${videoFileName}`
                      : "MP4 / WebM / MOV up to 200 MB. Files over ~45 MB are auto-compressed to fit Supabase storage, then uploaded. Or paste a YouTube/Shorts URL."}
                </span>
                <input
                  ref={videoRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  className="d-none"
                  onChange={(e) => {
                    void onVideoFile(e.target.files?.[0] ?? null);
                    e.target.value = "";
                  }}
                />
              </div>
            )}
          </div>

          <label className="admin-field-label">
            Year
            <select
              className="admin-field"
              value={year}
              onChange={(e) => {
                const nextYear = e.target.value;
                setYear(nextYear);
                setCategory(getDefaultEventCategory(nextYear));
              }}
              required
            >
              {YEAR_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field-label">
            Category
            <select className="admin-field" value={category} onChange={(e) => setCategory(e.target.value)} required>
              {getEventCategoriesForYear(year).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
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
            Show on Press Bits page
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
                  onClick={() => thumbRef.current?.click()}
                >
                  Upload thumbnail
                </button>
                {imageUrl ? (
                  <button
                    type="button"
                    className="btn admin-btn-ghost btn-sm"
                    onClick={() => {
                      setImageUrl("");
                      if (thumbRef.current) thumbRef.current.value = "";
                    }}
                  >
                    {sourceType === "youtube" ? "Use YouTube thumbnail" : "Clear thumbnail"}
                  </button>
                ) : null}
                <span className="small text-muted">
                  Optional. YouTube auto-thumbnail if empty; recommended for uploaded videos.
                </span>
              </div>
            </div>
            <input
              ref={thumbRef}
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
            <button type="submit" className="btn admin-btn-primary" disabled={saving || uploadingVideo}>
              {saving ? "Saving…" : editingId ? "Update press bit" : "Add press bit"}
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
        <AdminTable columns={["Thumb", "Title", "Source", "Year", "Category", "Status", "Open", "Actions"]}>
          {loading ? (
            <tr>
              <td colSpan={8}>
                <p className="mb-0 text-muted py-3">Loading press bits…</p>
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
                  <AdminBadge tone={item.sourceType === "upload" ? "orange" : "blue"}>
                    {item.sourceType === "upload" ? "Upload" : "YouTube"}
                  </AdminBadge>
                </td>
                <td>{item.year}</td>
                <td>
                  <AdminBadge>{item.category}</AdminBadge>
                </td>
                <td>
                  <AdminBadge tone={item.enabled ? "green" : "gray"}>
                    {item.enabled ? "Live" : "Hidden"}
                  </AdminBadge>
                </td>
                <td>
                  <a href={item.videoUrl} target="_blank" rel="noopener noreferrer" className="admin-link-btn">
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
              <td colSpan={8}>
                <p className="mb-0 text-muted py-3">
                  No press bits yet. Paste a YouTube/Shorts URL or upload an MP4 reel above.
                </p>
              </td>
            </tr>
          )}
        </AdminTable>
      </div>
    </div>
  );
}
