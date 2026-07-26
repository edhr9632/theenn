"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminBadge, AdminEmpty, AdminPageHeader, AdminTable } from "@/components/admin/AdminUi";
import {
  ADS_AUTOPLAY_MS,
  createAdSlideId,
  DEFAULT_SITE_ADS,
  DEFAULT_SITE_AD_SLIDES,
  readSiteAds,
  writeSiteAds,
  type SiteAdSlide,
  type SiteAdsConfig,
} from "@/lib/siteAds";

const ACCENT_OPTIONS: { value: SiteAdSlide["accent"]; label: string }[] = [
  { value: "navy", label: "ET Magazine blue" },
  { value: "enn", label: "ENN navy" },
  { value: "red", label: "EDHR dark" },
  { value: "sky", label: "Sky blue" },
  { value: "spotify", label: "Spotify green" },
];

const emptySlide = (): SiteAdSlide => ({
  id: createAdSlideId(),
  kicker: "",
  headline: "",
  subtext: "",
  listenUrl: DEFAULT_SITE_AD_SLIDES[0].listenUrl,
  followUrl: DEFAULT_SITE_AD_SLIDES[0].followUrl,
  bannerImageUrl: "",
  logoUrl: "",
  brandColor: "#1A6BC8",
  accent: "navy",
});

export default function AdminAdsPage() {
  const [config, setConfig] = useState<SiteAdsConfig>(DEFAULT_SITE_ADS);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<SiteAdSlide>(emptySlide());

  useEffect(() => {
    setConfig(readSiteAds());
    setReady(true);
  }, []);

  const persist = (next: SiteAdsConfig) => {
    setConfig(next);
    writeSiteAds(next);
  };

  const flash = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2200);
  };

  const resetDraft = () => {
    setEditingId(null);
    setDraft(emptySlide());
  };

  const onSaveSettings = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const autoplayMs = Number(form.get("autoplayMs") || 5000);
    persist({
      ...config,
      enabled: form.get("enabled") === "on",
      autoplayMs: Number.isFinite(autoplayMs) ? Math.max(ADS_AUTOPLAY_MS, autoplayMs) : ADS_AUTOPLAY_MS,
    });
    flash("Ad slider settings saved");
  };

  const onSubmitSlide = (event: FormEvent) => {
    event.preventDefault();
    const nextSlide: SiteAdSlide = {
      ...draft,
      id: editingId ?? createAdSlideId(),
      kicker: draft.kicker.trim() || "Featured",
      headline: draft.headline.trim() || "Education News Network",
      subtext: draft.subtext.trim() || "Stay updated with ENN",
      listenUrl: draft.listenUrl.trim() || DEFAULT_SITE_AD_SLIDES[0].listenUrl,
      followUrl: draft.followUrl.trim() || DEFAULT_SITE_AD_SLIDES[0].followUrl,
      bannerImageUrl: draft.bannerImageUrl.trim(),
      logoUrl: (draft.logoUrl || "").trim(),
      brandColor: (draft.brandColor || "").trim() || undefined,
      accent: draft.accent,
    };

    const slides = editingId
      ? config.slides.map((slide) => (slide.id === editingId ? nextSlide : slide))
      : [...config.slides, nextSlide].slice(0, 8);

    persist({ ...config, slides });
    flash(editingId ? "Ad slide updated" : "Ad slide added");
    resetDraft();
  };

  const startEdit = (slide: SiteAdSlide) => {
    setEditingId(slide.id);
    setDraft(slide);
  };

  const removeSlide = (id: string) => {
    if (config.slides.length <= 1) {
      flash("Keep at least one ad slide");
      return;
    }
    persist({ ...config, slides: config.slides.filter((slide) => slide.id !== id) });
    if (editingId === id) resetDraft();
    flash("Ad slide removed");
  };

  if (!ready) {
    return <p className="admin-empty mb-0">Loading ads…</p>;
  }

  return (
    <div className="admin-form-page admin-form-page--wide">
      <AdminPageHeader
        title="Ads"
        description="Manage the sliding header ads (3–4 recommended). They auto-rotate on the public site."
      />

      {message ? <p className="admin-flash mb-3">{message}</p> : null}

      <form className="admin-form-shell mb-4" onSubmit={onSaveSettings}>
        <section className="admin-form-card">
          <div className="admin-form-card-head">
            <div>
              <h2 className="admin-form-card-title mb-1">Slider settings</h2>
              <p className="admin-form-card-sub mb-0">Show/hide the header carousel and set autoplay speed.</p>
            </div>
            <AdminBadge tone={config.enabled ? "green" : "orange"}>
              {config.enabled ? `${config.slides.length} live` : "Hidden"}
            </AdminBadge>
          </div>
          <div className="admin-form-grid">
            <label className="admin-field-label admin-field-span admin-check-row">
              <input type="checkbox" name="enabled" defaultChecked={config.enabled} />
              Show sliding ads on the website
            </label>
            <label className="admin-field-label">
              Autoplay interval (ms)
              <input
                className="admin-field"
                name="autoplayMs"
                type="number"
                min={120000}
                step={30000}
                defaultValue={config.autoplayMs}
              />
              <span className="admin-field-hint">Minimum 120000 (2 minutes) so each slide stays longer.</span>
            </label>
          </div>
        </section>
        <div className="admin-form-footer-actions">
          <button type="submit" className="btn admin-btn-primary">
            Save slider settings
          </button>
        </div>
      </form>

      <section className="admin-form-card mb-4">
        <div className="admin-form-card-head">
          <div>
            <h2 className="admin-form-card-title mb-1">{editingId ? "Edit ad slide" : "Add ad slide"}</h2>
            <p className="admin-form-card-sub mb-0">Aim for 3–4 slides. Optional image replaces the coded layout.</p>
          </div>
        </div>

        <form className="admin-form-grid" onSubmit={onSubmitSlide}>
          <label className="admin-field-label">
            Kicker
            <input
              className="admin-field"
              value={draft.kicker}
              onChange={(e) => setDraft((prev) => ({ ...prev, kicker: e.target.value }))}
              required
            />
          </label>
          <label className="admin-field-label">
            Accent
            <select
              className="admin-field"
              value={draft.accent}
              onChange={(e) => setDraft((prev) => ({ ...prev, accent: e.target.value as SiteAdSlide["accent"] }))}
            >
              {ACCENT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field-label admin-field-span">
            Headline
            <input
              className="admin-field"
              value={draft.headline}
              onChange={(e) => setDraft((prev) => ({ ...prev, headline: e.target.value }))}
              required
            />
          </label>
          <label className="admin-field-label admin-field-span">
            Subtext
            <input
              className="admin-field"
              value={draft.subtext}
              onChange={(e) => setDraft((prev) => ({ ...prev, subtext: e.target.value }))}
              required
            />
          </label>
          <label className="admin-field-label admin-field-span">
            Primary button URL
            <input
              className="admin-field"
              value={draft.listenUrl}
              onChange={(e) => setDraft((prev) => ({ ...prev, listenUrl: e.target.value }))}
              required
            />
          </label>
          <label className="admin-field-label admin-field-span">
            Secondary button URL
            <input
              className="admin-field"
              value={draft.followUrl}
              onChange={(e) => setDraft((prev) => ({ ...prev, followUrl: e.target.value }))}
              required
            />
          </label>
          <label className="admin-field-label admin-field-span">
            Logo image URL
            <input
              className="admin-field"
              value={draft.logoUrl || ""}
              onChange={(e) => setDraft((prev) => ({ ...prev, logoUrl: e.target.value }))}
              placeholder="/images/brands/et-magazine.svg"
            />
          </label>
          <label className="admin-field-label">
            Brand color
            <input
              className="admin-field"
              value={draft.brandColor || ""}
              onChange={(e) => setDraft((prev) => ({ ...prev, brandColor: e.target.value }))}
              placeholder="#080808"
            />
          </label>
          <label className="admin-field-label admin-field-span">
            Banner image URL (optional)
            <input
              className="admin-field"
              value={draft.bannerImageUrl}
              onChange={(e) => setDraft((prev) => ({ ...prev, bannerImageUrl: e.target.value }))}
              placeholder="Leave blank for coded design"
            />
          </label>
          <div className="admin-field-span d-flex gap-2">
            <button type="submit" className="btn admin-btn-primary">
              {editingId ? "Update slide" : "Add slide"}
            </button>
            {editingId ? (
              <button type="button" className="btn admin-btn-ghost" onClick={resetDraft}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <h2 className="admin-panel-title mb-0">Slides ({config.slides.length})</h2>
        </div>
        {config.slides.length ? (
          <AdminTable columns={["Order", "Headline", "Accent", "Primary URL", "Actions"]}>
            {config.slides.map((slide, index) => (
              <tr key={slide.id}>
                <td>{index + 1}</td>
                <td>
                  <p className="admin-cell-title mb-0">{slide.headline}</p>
                  <p className="admin-cell-sub mb-0">{slide.kicker}</p>
                </td>
                <td>
                  <AdminBadge>{slide.accent}</AdminBadge>
                </td>
                <td>
                  <a href={slide.listenUrl} target="_blank" rel="noopener noreferrer" className="admin-link-btn">
                    Open
                  </a>
                </td>
                <td>
                  <div className="admin-row-actions">
                    <button type="button" className="admin-link-btn" onClick={() => startEdit(slide)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="admin-link-btn admin-link-btn--danger"
                      onClick={() => removeSlide(slide.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </AdminTable>
        ) : (
          <AdminEmpty message="No ad slides yet." />
        )}
      </div>
    </div>
  );
}
