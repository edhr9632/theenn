"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { AdminBadge, AdminPageHeader, AdminTable } from "@/components/admin/AdminUi";
import { AdminRowActions } from "@/components/admin/AdminRowActions";
import {
  EVENT_YEAR_OPTIONS,
  getDefaultEventCategory,
  getEventCategoriesForYear,
} from "@/lib/eventCategories";
import { uploadEventMediaAsset } from "@/lib/eventMediaUpload";
import { youtubeThumb } from "@/lib/siteVideos";
import { detectVideoSourceType, type EventVideoSourceType } from "@/lib/eventPeopleTypes";

type PersonKind = "speaker" | "sponsor";

type PersonItem = {
  id: string;
  name: string;
  roleOrTier: string;
  image: string;
  category: string;
  year: number;
  videoUrl: string;
  sourceType: EventVideoSourceType;
  sortOrder: number;
};

type AdminEventPeoplePageProps = {
  kind: PersonKind;
};

export default function AdminEventPeoplePage({ kind }: AdminEventPeoplePageProps) {
  const isSpeaker = kind === "speaker";
  const apiBase = isSpeaker ? "/api/admin/speakers" : "/api/admin/sponsors";
  const videoFolder = isSpeaker ? "speakers/videos" : "sponsors/videos";
  const thumbFolder = isSpeaker ? "speakers/thumbs" : "sponsors/thumbs";
  const label = isSpeaker ? "speaker" : "sponsor";
  const Label = isSpeaker ? "Speaker" : "Sponsor";
  const secondaryLabel = isSpeaker ? "Role" : "Tier";

  const thumbRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<PersonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [roleOrTier, setRoleOrTier] = useState("");
  const [sourceType, setSourceType] = useState<EventVideoSourceType>("youtube");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFileName, setVideoFileName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [year, setYear] = useState(String(EVENT_YEAR_OPTIONS[0]));
  const [category, setCategory] = useState(getDefaultEventCategory(EVENT_YEAR_OPTIONS[0]));
  const [sortOrder, setSortOrder] = useState("0");
  const [saving, setSaving] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const loadItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiBase);
      const data = (await response.json()) as {
        items?: Array<{
          id: string;
          name: string;
          role?: string;
          tier?: string;
          image: string;
          category: string;
          year: number;
          videoUrl: string;
          sourceType: EventVideoSourceType;
          sortOrder: number;
        }>;
      };
      const mapped =
        data.items?.map((item) => ({
          id: item.id,
          name: item.name,
          roleOrTier: isSpeaker ? item.role || "" : item.tier || "",
          image: item.image,
          category: item.category,
          year: item.year,
          videoUrl: item.videoUrl,
          sourceType: item.sourceType,
          sortOrder: item.sortOrder,
        })) ?? [];
      setItems(response.ok ? mapped : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase]);

  const flash = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2200);
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setRoleOrTier("");
    setSourceType("youtube");
    setVideoUrl("");
    setVideoFileName("");
    setImageUrl("");
    setYear(String(EVENT_YEAR_OPTIONS[0]));
    setCategory(getDefaultEventCategory(EVENT_YEAR_OPTIONS[0]));
    setSortOrder("0");
    if (thumbRef.current) thumbRef.current.value = "";
    if (videoRef.current) videoRef.current.value = "";
  };

  const startEdit = (item: PersonItem) => {
    setEditingId(item.id);
    setName(item.name);
    setRoleOrTier(item.roleOrTier);
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
    if (thumbRef.current) thumbRef.current.value = "";
    if (videoRef.current) videoRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onThumbFile = async (file: File | null) => {
    if (!file) return;
    try {
      const publicUrl = await uploadEventMediaAsset(file, thumbFolder, name || label);
      setImageUrl(publicUrl);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Could not upload image.");
    }
  };

  const onVideoFile = async (file: File | null) => {
    if (!file) return;
    setUploadingVideo(true);
    try {
      const publicUrl = await uploadEventMediaAsset(file, videoFolder, name || label);
      setVideoUrl(publicUrl);
      setVideoFileName(file.name);
      setSourceType("upload");
      flash("Video uploaded");
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Could not upload video.");
    } finally {
      setUploadingVideo(false);
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanVideo = videoUrl.trim();
    if (!cleanName || !cleanVideo) {
      window.alert("Name and a YouTube/Shorts URL or uploaded video are required.");
      return;
    }

    setSaving(true);
    const resolvedSource = sourceType === "upload" ? "upload" : detectVideoSourceType(cleanVideo);
    const payload = {
      name: cleanName,
      [isSpeaker ? "role" : "tier"]: roleOrTier.trim(),
      videoUrl: cleanVideo,
      sourceType: resolvedSource,
      imageUrl: imageUrl.trim() || (resolvedSource === "youtube" ? youtubeThumb(cleanVideo) : ""),
      year: Number(year),
      category: category.trim(),
      sortOrder: Number(sortOrder) || 0,
    };

    try {
      const url = editingId ? `${apiBase}/${encodeURIComponent(editingId)}` : apiBase;
      const method = editingId ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        window.alert(data.error ?? `Could not save ${label}.`);
        return;
      }
      flash(editingId ? `${Label} updated` : `${Label} added`);
      resetForm();
      await loadItems();
    } catch {
      window.alert(`Network error. Could not save ${label}.`);
    } finally {
      setSaving(false);
    }
  };

  const removeItem = async (id: string) => {
    if (!window.confirm(`Delete this ${label}?`)) return;
    try {
      const response = await fetch(`${apiBase}/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!response.ok) {
        window.alert(`Could not delete ${label}.`);
        return;
      }
      if (editingId === id) resetForm();
      flash(`${Label} deleted`);
      await loadItems();
    } catch {
      window.alert("Network error while deleting.");
    }
  };

  const previewSrc =
    imageUrl.trim() || (sourceType === "youtube" && videoUrl.trim() ? youtubeThumb(videoUrl.trim()) : "");

  return (
    <div>
      <AdminPageHeader
        title={`${Label}s`}
        description={`${Label}s appear on Events → ${Label}s. Add a YouTube/Shorts URL or upload a video file. Filterable by year and category.`}
      />

      {message ? <p className="admin-flash mb-3">{message}</p> : null}

      <div className="admin-panel mb-4">
        <h2 className="h6 mb-3">{editingId ? `Edit ${label}` : `Add ${label}`}</h2>
        <form className="admin-form-grid" onSubmit={onSubmit}>
          <label className="admin-field-label">
            Name
            <input className="admin-field" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label className="admin-field-label">
            {secondaryLabel}
            <input
              className="admin-field"
              value={roleOrTier}
              onChange={(e) => setRoleOrTier(e.target.value)}
              placeholder={isSpeaker ? "Principal / Educator" : "Gold Sponsor"}
            />
          </label>

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
              {EVENT_YEAR_OPTIONS.map((option) => (
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

          <div className="admin-field-label admin-field-span">
            <span className="d-block mb-2">Video source</span>
            <div className="d-flex flex-wrap gap-3 mb-3">
              <label className="admin-check-row mb-0">
                <input
                  type="radio"
                  name={`${kind}-video-source`}
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
                  name={`${kind}-video-source`}
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
                    {uploadingVideo ? "Uploading…" : "Choose video file"}
                  </button>
                  {videoUrl ? (
                    <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="admin-link-btn">
                      Preview uploaded video
                    </a>
                  ) : null}
                </div>
                <span className="small text-muted">
                  {videoFileName
                    ? `Selected: ${videoFileName}`
                    : "MP4 / WebM / MOV up to 200 MB. Uploads to Supabase storage."}
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
            Sort order
            <input className="admin-field" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
          </label>

          <div className="admin-field-label admin-field-span">
            <span className="d-block mb-2">Image / thumbnail</span>
            <div className="d-flex flex-wrap align-items-start gap-3">
              <div className="border rounded overflow-hidden bg-light flex-shrink-0" style={{ width: 120, height: 120 }}>
                {previewSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewSrc} alt="" className="w-100 h-100" style={{ objectFit: "cover" }} />
                ) : (
                  <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted small px-2 text-center">
                    No image
                  </div>
                )}
              </div>
              <div className="d-flex flex-column gap-2">
                <button type="button" className="btn admin-btn-primary btn-sm" onClick={() => thumbRef.current?.click()}>
                  Upload image
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
                    {sourceType === "youtube" ? "Use YouTube thumbnail" : "Clear image"}
                  </button>
                ) : null}
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
              {saving ? "Saving…" : editingId ? `Update ${label}` : `Add ${label}`}
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
        <AdminTable columns={["Image", "Name", secondaryLabel, "Source", "Year", "Category", "Open", "Actions"]}>
          {loading ? (
            <tr>
              <td colSpan={8}>
                <p className="mb-0 text-muted py-3">Loading {label}s…</p>
              </td>
            </tr>
          ) : items.length ? (
            items.map((item) => (
              <tr key={item.id}>
                <td>
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt="" width={48} height={48} className="rounded" style={{ objectFit: "cover" }} />
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  <p className="admin-cell-title mb-0">{item.name}</p>
                </td>
                <td>{item.roleOrTier || "—"}</td>
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
                  {item.videoUrl ? (
                    <a href={item.videoUrl} target="_blank" rel="noopener noreferrer" className="admin-link-btn">
                      Open
                    </a>
                  ) : (
                    "—"
                  )}
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
                  No {label}s yet. Add a YouTube/Shorts URL or upload a video above.
                </p>
              </td>
            </tr>
          )}
        </AdminTable>
      </div>
    </div>
  );
}
