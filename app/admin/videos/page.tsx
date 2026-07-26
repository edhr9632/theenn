"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AdminBadge, AdminEmpty, AdminPageHeader, AdminTable } from "@/components/admin/AdminUi";
import {
  createVideoId,
  DEFAULT_SITE_VIDEOS,
  readSiteVideos,
  writeSiteVideos,
  youtubeThumb,
  type SiteVideoItem,
  type SiteVideoTab,
  type SiteVideosConfig,
} from "@/lib/siteVideos";

const TAB_LABELS: Record<SiteVideoTab, string> = {
  education: "Top Education News",
  panels: "Panel Discussions",
  podcasts: "Podcasts",
};

export default function AdminVideosPage() {
  const [config, setConfig] = useState<SiteVideosConfig>(DEFAULT_SITE_VIDEOS);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("5 min");
  const [image, setImage] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [meta, setMeta] = useState("K-12");
  const [tab, setTab] = useState<SiteVideoTab>("education");

  useEffect(() => {
    setConfig(readSiteVideos());
    setReady(true);
  }, []);

  const persist = (next: SiteVideosConfig) => {
    setConfig(next);
    writeSiteVideos(next);
  };

  const flash = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2200);
  };

  const resetItemForm = () => {
    setEditingId(null);
    setTitle("");
    setDuration("5 min");
    setImage("");
    setYoutubeUrl("");
    setMeta("K-12");
    setTab("education");
  };

  const onSaveFeatured = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next: SiteVideosConfig = {
      ...config,
      enabled: form.get("enabled") === "on",
      featuredTitle: String(form.get("featuredTitle") ?? "").trim() || DEFAULT_SITE_VIDEOS.featuredTitle,
      youtubeUrl: String(form.get("youtubeUrl") ?? "").trim() || DEFAULT_SITE_VIDEOS.youtubeUrl,
      channelUrl: String(form.get("channelUrl") ?? "").trim() || DEFAULT_SITE_VIDEOS.channelUrl,
      channelLabel: String(form.get("channelLabel") ?? "").trim() || DEFAULT_SITE_VIDEOS.channelLabel,
      showEducation: form.get("showEducation") === "on",
      showPanels: form.get("showPanels") === "on",
      showPodcasts: form.get("showPodcasts") === "on",
    };
    persist(next);
    flash("Videos settings saved");
  };

  const onSubmitItem = (event: FormEvent) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanUrl = youtubeUrl.trim();
    if (!cleanTitle || !cleanUrl) return;

    const thumb = image.trim() || youtubeThumb(cleanUrl);
    const item: SiteVideoItem = {
      id: editingId ?? createVideoId(),
      title: cleanTitle,
      duration: duration.trim() || "Watch",
      image: thumb,
      youtubeUrl: cleanUrl,
      meta: meta.trim() || "Video",
      tab,
    };

    const items = editingId
      ? config.items.map((row) => (row.id === editingId ? item : row))
      : [...config.items, item];

    persist({ ...config, items });
    flash(editingId ? "Video updated" : "Video added");
    resetItemForm();
  };

  const startEdit = (item: SiteVideoItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDuration(item.duration);
    setImage(item.image);
    setYoutubeUrl(item.youtubeUrl);
    setMeta(item.meta);
    setTab(item.tab);
  };

  const removeItem = (id: string) => {
    persist({ ...config, items: config.items.filter((item) => item.id !== id) });
    if (editingId === id) resetItemForm();
    flash("Video removed");
  };

  const itemsByTab = useMemo(() => config.items, [config.items]);

  if (!ready) {
    return <p className="admin-empty mb-0">Loading videos…</p>;
  }

  return (
    <div className="admin-form-page admin-form-page--wide">
      <AdminPageHeader
        title="Videos"
        description="Control the homepage Videos section, featured YouTube clip, channel links, and Must Watch list."
      />

      {message ? <p className="admin-flash mb-3">{message}</p> : null}

      <form className="admin-form-shell mb-4" onSubmit={onSaveFeatured}>
        <section className="admin-form-card">
          <div className="admin-form-card-head">
            <div>
              <h2 className="admin-form-card-title mb-1">Featured / Now Playing</h2>
              <p className="admin-form-card-sub mb-0">
                Powers the floating player, Subscribe actions, and the lead clip in Videos.
              </p>
            </div>
            <AdminBadge tone={config.enabled ? "green" : "orange"}>
              {config.enabled ? "Section live" : "Section hidden"}
            </AdminBadge>
          </div>

          <div className="admin-form-grid">
            <label className="admin-field-label admin-field-span admin-check-row">
              <input type="checkbox" name="enabled" defaultChecked={config.enabled} />
              Show Videos section on the homepage
            </label>

            <label className="admin-field-label admin-field-span">
              Featured video title
              <input className="admin-field" name="featuredTitle" defaultValue={config.featuredTitle} required />
            </label>
            <label className="admin-field-label admin-field-span">
              YouTube video URL
              <input className="admin-field" name="youtubeUrl" type="url" defaultValue={config.youtubeUrl} required />
            </label>
            <label className="admin-field-label">
              Channel URL
              <input className="admin-field" name="channelUrl" type="url" defaultValue={config.channelUrl} required />
            </label>
            <label className="admin-field-label">
              Channel label
              <input className="admin-field" name="channelLabel" defaultValue={config.channelLabel} required />
            </label>

            <label className="admin-field-label admin-check-row">
              <input type="checkbox" name="showEducation" defaultChecked={config.showEducation} />
              Show Top Education News tab
            </label>
            <label className="admin-field-label admin-check-row">
              <input type="checkbox" name="showPanels" defaultChecked={config.showPanels} />
              Show Panel Discussions tab
            </label>
            <label className="admin-field-label admin-check-row">
              <input type="checkbox" name="showPodcasts" defaultChecked={config.showPodcasts} />
              Show Podcasts tab
            </label>
          </div>
        </section>

        <div className="admin-form-footer-actions">
          <button type="submit" className="btn admin-btn-primary">
            Save videos settings
          </button>
        </div>
      </form>

      <section className="admin-form-card mb-4">
        <div className="admin-form-card-head">
          <div>
            <h2 className="admin-form-card-title mb-1">{editingId ? "Edit video" : "Add video"}</h2>
            <p className="admin-form-card-sub mb-0">
              Custom videos appear in the Videos section for the selected tab. Leave empty to use site news/panels/podcasts.
            </p>
          </div>
        </div>

        <form className="admin-form-grid" onSubmit={onSubmitItem}>
          <label className="admin-field-label admin-field-span">
            Title
            <input className="admin-field" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <label className="admin-field-label">
            Tab
            <select className="admin-field" value={tab} onChange={(e) => setTab(e.target.value as SiteVideoTab)}>
              <option value="education">Top Education News</option>
              <option value="panels">Panel Discussions</option>
              <option value="podcasts">Podcasts</option>
            </select>
          </label>
          <label className="admin-field-label">
            Duration / meta label
            <input className="admin-field" value={duration} onChange={(e) => setDuration(e.target.value)} />
          </label>
          <label className="admin-field-label">
            Category / meta
            <input className="admin-field" value={meta} onChange={(e) => setMeta(e.target.value)} />
          </label>
          <label className="admin-field-label admin-field-span">
            YouTube URL
            <input
              className="admin-field"
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              required
            />
          </label>
          <label className="admin-field-label admin-field-span">
            Thumbnail image URL (optional)
            <input
              className="admin-field"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="Auto from YouTube if blank"
            />
          </label>
          <div className="admin-field-span d-flex gap-2">
            <button type="submit" className="btn admin-btn-primary">
              {editingId ? "Update video" : "Add video"}
            </button>
            {editingId ? (
              <button type="button" className="btn admin-btn-ghost" onClick={resetItemForm}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <h2 className="admin-panel-title mb-0">Custom videos ({itemsByTab.length})</h2>
        </div>
        {itemsByTab.length ? (
          <AdminTable columns={["Title", "Tab", "Meta", "YouTube", "Actions"]}>
            {itemsByTab.map((item) => (
              <tr key={item.id}>
                <td>
                  <p className="admin-cell-title mb-0">{item.title}</p>
                  <p className="admin-cell-sub mb-0">{item.duration}</p>
                </td>
                <td>
                  <AdminBadge>{TAB_LABELS[item.tab]}</AdminBadge>
                </td>
                <td>{item.meta}</td>
                <td>
                  <a href={item.youtubeUrl} target="_blank" rel="noopener noreferrer" className="admin-link-btn">
                    Open
                  </a>
                </td>
                <td>
                  <div className="admin-row-actions">
                    <button type="button" className="admin-link-btn" onClick={() => startEdit(item)}>
                      Edit
                    </button>
                    <button type="button" className="admin-link-btn admin-link-btn--danger" onClick={() => removeItem(item.id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </AdminTable>
        ) : (
          <AdminEmpty message="No custom videos yet. The homepage will use built-in news, panels, and podcasts until you add some." />
        )}
      </div>
    </div>
  );
}
