"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { AdminBadge, AdminEmpty, AdminPageHeader, AdminTable } from "@/components/admin/AdminUi";
import type { FestivalTheme } from "@/lib/festivalPopupConfig";
import type { FestivalAdminState, FestivalPost } from "@/lib/festivalTypes";

const THEME_OPTIONS: { value: FestivalTheme; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "onam", label: "Onam" },
  { value: "diwali", label: "Diwali" },
  { value: "holi", label: "Holi" },
  { value: "independence", label: "Independence / Republic" },
];

const EMPTY_STATE: FestivalAdminState = {
  enabled: false,
  activePostId: null,
  showOncePerSession: false,
  showOncePerDay: false,
  closeOnOutsideClick: true,
  closeOnEscape: true,
  confettiEnabled: false,
  confettiCount: 0,
  animationDuration: 900,
  storageKey: "enn-festival-popup",
  posts: [],
};

const MAX_IMAGE_EDGE = 1600;
const IMAGE_QUALITY = 0.88;

async function compressImageFile(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not prepare image.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", IMAGE_QUALITY);
}

async function saveConfig(payload: Record<string, unknown>) {
  const response = await fetch("/api/admin/festival", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await response.json()) as { festival?: FestivalAdminState; error?: string };
  if (!response.ok) throw new Error(data.error ?? "Could not save festival settings.");
  return data.festival ?? null;
}

export default function AdminFestivalPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<FestivalAdminState>(EMPTY_STATE);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [messageText, setMessageText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [theme, setTheme] = useState<FestivalTheme>("onam");
  const [href, setHref] = useState("");
  const [topBarTickerText, setTopBarTickerText] = useState("");
  const [listenIntroText, setListenIntroText] = useState("");
  const [turnOnAfterSave, setTurnOnAfterSave] = useState(true);

  const flash = useCallback((text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 3200);
  }, []);

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/festival");
    const data = (await response.json()) as { festival?: FestivalAdminState; error?: string };
    if (!response.ok) {
      throw new Error(data.error ?? "Could not load festival settings.");
    }
    setState(data.festival ?? EMPTY_STATE);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void load()
      .catch((error: unknown) => {
        if (!cancelled) {
          window.alert(error instanceof Error ? error.message : "Could not load festival settings.");
        }
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const resetPostForm = () => {
    setEditingId(null);
    setTitle("");
    setSubtitle("");
    setMessageText("");
    setImageUrl("");
    setTheme("onam");
    setHref("");
    setTopBarTickerText("");
    setListenIntroText("");
    setTurnOnAfterSave(true);
    if (fileRef.current) fileRef.current.value = "";
  };

  const startEdit = (post: FestivalPost) => {
    setEditingId(post.id);
    setTitle(post.title);
    setSubtitle(post.subtitle);
    setMessageText(post.message);
    setImageUrl(post.imageUrl);
    setTheme(post.theme);
    setHref(post.href);
    setTopBarTickerText(post.topBarTickerText);
    setListenIntroText(post.listenIntroText);
    setTurnOnAfterSave(state.activePostId === post.id && state.enabled);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onPickImage = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      window.alert("Please upload an image file.");
      return;
    }
    try {
      setImageUrl(await compressImageFile(file));
    } catch {
      window.alert("Could not process that image. Try a JPG or PNG.");
    }
  };

  const onToggleWebsite = async (enabled: boolean) => {
    if (enabled && !state.activePostId && !state.posts.length) {
      window.alert("Create a festival post first, then turn it ON.");
      return;
    }

    setSaving(true);
    try {
      const activePostId =
        state.activePostId ||
        state.posts.find((post) => post.published)?.id ||
        state.posts[0]?.id ||
        null;

      const festival = await saveConfig({
        enabled,
        activePostId,
        showOncePerSession: false,
        showOncePerDay: false,
        closeOnOutsideClick: true,
        closeOnEscape: true,
        storageKey: enabled
          ? `enn-festival-popup-${activePostId ?? "live"}-${Date.now().toString(36)}`
          : state.storageKey,
      });
      if (festival) setState(festival);
      flash(
        enabled
          ? "Festival is ON — popup + top bar lines are live on the website."
          : "Festival is OFF — removed from the website.",
      );
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Could not update ON/OFF.");
    } finally {
      setSaving(false);
    }
  };

  const onTurnOnPost = async (post: FestivalPost) => {
    setSaving(true);
    try {
      const festival = await saveConfig({
        enabled: true,
        activePostId: post.id,
        showOncePerSession: false,
        showOncePerDay: false,
        closeOnOutsideClick: true,
        closeOnEscape: true,
        storageKey: `enn-festival-popup-${post.slug}-${Date.now().toString(36)}`,
      });
      if (festival) setState(festival);
      flash(`“${post.title}” is ON — showing on the website now.`);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Could not turn this post ON.");
    } finally {
      setSaving(false);
    }
  };

  const onSavePost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !imageUrl.trim()) {
      window.alert("Title and poster image are required.");
      return;
    }

    setSaving(true);
    const payload = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      message: messageText.trim(),
      imageUrl: imageUrl.trim(),
      theme,
      href: href.trim(),
      topBarTickerText: topBarTickerText.trim(),
      listenIntroText: listenIntroText.trim(),
      published: true,
      sortOrder: 0,
    };

    try {
      const url = editingId
        ? `/api/admin/festival/posts/${encodeURIComponent(editingId)}`
        : "/api/admin/festival/posts";
      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { post?: FestivalPost; error?: string };
      if (!response.ok || !data.post) {
        window.alert(data.error ?? "Could not save festival post to the database.");
        return;
      }

      if (turnOnAfterSave) {
        const festival = await saveConfig({
          enabled: true,
          activePostId: data.post.id,
          showOncePerSession: false,
          showOncePerDay: false,
          closeOnOutsideClick: true,
          closeOnEscape: true,
          storageKey: `enn-festival-popup-${data.post.slug}-${Date.now().toString(36)}`,
        });
        if (festival) setState(festival);
        else await load();
        flash(`Saved & turned ON — “${data.post.title}” is live on the website.`);
      } else {
        await load();
        flash(editingId ? "Festival post updated in database." : "Festival post saved in database.");
      }
      resetPostForm();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Could not save festival post.");
    } finally {
      setSaving(false);
    }
  };

  const onDeletePost = async (post: FestivalPost) => {
    if (!window.confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/festival/posts/${encodeURIComponent(post.id)}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        window.alert(data.error ?? "Could not delete festival post.");
        return;
      }
      if (editingId === post.id) resetPostForm();
      if (state.activePostId === post.id) {
        await saveConfig({ enabled: false, activePostId: null });
      }
      await load();
      flash("Festival post deleted.");
    } catch {
      window.alert("Could not delete festival post.");
    } finally {
      setSaving(false);
    }
  };

  if (!ready) {
    return (
      <div className="admin-form-page admin-form-page--wide">
        <AdminPageHeader title="Festival Popup" description="Loading festival posts…" />
      </div>
    );
  }

  const activePost = state.posts.find((post) => post.id === state.activePostId) ?? null;

  return (
    <div className="admin-form-page admin-form-page--wide">
      <AdminPageHeader
        title="Festival Popup"
        description="Create festival posts (poster + greeting + top bar lines). Turn ON to show on the website. Turn OFF to hide."
      />

      {message ? <p className="text-success fw-semibold mb-3">{message}</p> : null}

      <section className="admin-form-card mb-4">
        <div className="admin-form-card-head">
          <div>
            <h2 className="admin-form-card-title mb-1">Website display</h2>
            <p className="admin-form-card-sub mb-0">
              When ON, the active festival poster popup and top LIVE bar lines show on theenn.com.
            </p>
          </div>
          <AdminBadge tone={state.enabled ? "green" : "orange"}>
            {state.enabled ? "ON — Live" : "OFF"}
          </AdminBadge>
        </div>

        <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
          <label className="admin-field-label d-flex align-items-center gap-2 mb-0">
            <input
              type="checkbox"
              checked={state.enabled}
              disabled={saving}
              onChange={(event) => void onToggleWebsite(event.target.checked)}
            />
            <strong>Show festival on website (ON / OFF)</strong>
          </label>
        </div>

        {activePost ? (
          <p className="mb-0 small text-muted">
            Active post: <strong>{activePost.title}</strong>
            {activePost.topBarTickerText ? (
              <>
                {" "}
                · Top bar: “{activePost.topBarTickerText}”
              </>
            ) : null}
          </p>
        ) : (
          <p className="mb-0 small text-muted">No active post yet — create one below and turn it ON.</p>
        )}
      </section>

      <form className="admin-form-shell mb-4" onSubmit={onSavePost}>
        <section className="admin-form-card">
          <div className="admin-form-card-head">
            <div>
              <h2 className="admin-form-card-title mb-1">
                {editingId ? "Edit festival post" : "Create festival post"}
              </h2>
              <p className="admin-form-card-sub mb-0">
                Upload poster image, write greeting text, and add the scrolling top-bar lines.
              </p>
            </div>
            {editingId ? <AdminBadge tone="orange">Editing</AdminBadge> : null}
          </div>

          <div className="admin-form-grid">
            <label className="admin-field-label">
              Title
              <input
                className="admin-field"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Happy Onam"
                required
              />
            </label>

            <label className="admin-field-label">
              Subtitle
              <input
                className="admin-field"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Festival of Prosperity"
              />
            </label>

            <label className="admin-field-label">
              Theme
              <select
                className="admin-field"
                value={theme}
                onChange={(e) => setTheme(e.target.value as FestivalTheme)}
              >
                {THEME_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-field-label admin-field-span">
              Greeting message (shown when visitor hovers / taps the poster)
              <textarea
                className="admin-field"
                rows={3}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Celebrating tradition, togetherness & prosperity…"
              />
            </label>

            <label className="admin-field-label admin-field-span">
              Top LIVE bar lines (scrolling text)
              <input
                className="admin-field"
                value={topBarTickerText}
                onChange={(e) => setTopBarTickerText(e.target.value)}
                placeholder="Happy Onam & Eid Mubarak — celebrating togetherness, prosperity & joy"
              />
            </label>

            <label className="admin-field-label admin-field-span">
              Listen News intro (spoken before headlines)
              <textarea
                className="admin-field"
                rows={2}
                value={listenIntroText}
                onChange={(e) => setListenIntroText(e.target.value)}
                placeholder="Happy Onam from Education News Network…"
              />
            </label>

            <label className="admin-field-label admin-field-span">
              Optional link when poster is clicked
              <input
                className="admin-field"
                value={href}
                onChange={(e) => setHref(e.target.value)}
                placeholder="https://…"
              />
            </label>

            <div className="admin-field-label admin-field-span">
              <span className="d-block mb-2">Poster image</span>
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt=""
                  className="admin-featured-preview mb-2"
                  style={{ maxHeight: 220, width: "auto", borderRadius: 8 }}
                />
              ) : (
                <div className="admin-featured-empty mb-2">No poster selected</div>
              )}
              <div className="d-flex flex-wrap gap-2 mb-2">
                <button
                  type="button"
                  className="btn admin-btn-primary btn-sm"
                  onClick={() => fileRef.current?.click()}
                >
                  Upload image
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
              <input
                className="admin-field"
                value={imageUrl.startsWith("data:") ? "" : imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Or paste image URL /public path e.g. /images/festivals/onam.png"
              />
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="d-none"
                onChange={(e) => {
                  void onPickImage(e.target.files?.[0] ?? null);
                  e.target.value = "";
                }}
              />
            </div>

            <label className="admin-field-label admin-field-span d-flex align-items-center gap-2">
              <input
                type="checkbox"
                checked={turnOnAfterSave}
                onChange={(e) => setTurnOnAfterSave(e.target.checked)}
              />
              Turn this post ON on the website after saving
            </label>
          </div>

          <div className="admin-form-actions mt-3 d-flex flex-wrap gap-2">
            <button type="submit" className="btn admin-btn-primary" disabled={saving}>
              {saving
                ? "Saving…"
                : editingId
                  ? turnOnAfterSave
                    ? "Update & turn ON"
                    : "Update post"
                  : turnOnAfterSave
                    ? "Save & turn ON"
                    : "Save post"}
            </button>
            {editingId ? (
              <button type="button" className="btn admin-btn-ghost" onClick={resetPostForm}>
                Cancel edit
              </button>
            ) : null}
          </div>
        </section>
      </form>

      <section className="admin-form-card">
        <div className="admin-form-card-head">
          <div>
            <h2 className="admin-form-card-title mb-1">Saved festival posts</h2>
            <p className="admin-form-card-sub mb-0">
              Stored in the database. Use Turn ON for the one you want on the website.
            </p>
          </div>
        </div>

        {!state.posts.length ? (
          <AdminEmpty message="No festival posts yet. Create a post above — it is saved in the database." />
        ) : (
          <AdminTable columns={["Poster", "Title / lines", "Status", "Actions"]}>
            {state.posts.map((post) => {
              const isLive = state.enabled && state.activePostId === post.id;
              return (
                <tr key={post.id}>
                  <td style={{ width: 88 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.imageUrl}
                      alt=""
                      width={64}
                      height={64}
                      style={{ objectFit: "cover", borderRadius: 6 }}
                    />
                  </td>
                  <td>
                    <strong>{post.title}</strong>
                    <div className="text-muted small">{post.subtitle || post.slug}</div>
                    {post.topBarTickerText ? (
                      <div className="text-muted small mt-1">Top bar: {post.topBarTickerText}</div>
                    ) : null}
                  </td>
                  <td>
                    <AdminBadge tone={isLive ? "green" : "orange"}>
                      {isLive ? "ON — Live" : "Saved"}
                    </AdminBadge>
                  </td>
                  <td>
                    <div className="d-flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="btn admin-btn-primary btn-sm"
                        disabled={saving || isLive}
                        onClick={() => void onTurnOnPost(post)}
                      >
                        {isLive ? "Already ON" : "Turn ON"}
                      </button>
                      <button
                        type="button"
                        className="btn admin-btn-ghost btn-sm"
                        onClick={() => startEdit(post)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn admin-btn-ghost btn-sm text-danger"
                        disabled={saving}
                        onClick={() => void onDeletePost(post)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </AdminTable>
        )}
      </section>
    </div>
  );
}
