"use client";

import { AdminBadge, AdminPageHeader } from "@/components/admin/AdminUi";

export default function AdminSettingsPage() {
  return (
    <div className="admin-form-page admin-form-page--wide">
      <AdminPageHeader
        title="Settings"
        description="Site-wide options and default SEO. Persist these via your CMS / API when you go dynamic."
      />

      <form
        className="admin-form-shell"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <section className="admin-form-card">
          <div className="admin-form-card-head">
            <div>
              <h2 className="admin-form-card-title mb-1">General</h2>
              <p className="admin-form-card-sub mb-0">Brand details shown across the public site.</p>
            </div>
            <AdminBadge tone="orange">Wire to API</AdminBadge>
          </div>
          <div className="admin-form-grid">
            <label className="admin-field-label">
              Site name
              <input className="admin-field" name="siteName" defaultValue="Education News Network" />
            </label>
            <label className="admin-field-label">
              Public email
              <input className="admin-field" name="email" defaultValue="info@educationtoday.co" />
            </label>
            <label className="admin-field-label admin-field-span">
              Tagline
              <input
                className="admin-field"
                name="tagline"
                defaultValue="Independent education journalism for schools, educators, and parents."
              />
            </label>
            <label className="admin-field-label admin-field-span">
              Office address
              <textarea
                className="admin-field"
                name="address"
                rows={3}
                defaultValue="3rd floor, Sai Sobagu, 461, Outer Ring Rd, Teachers colony, HSR Layout, Bengaluru, Karnataka 560034"
              />
            </label>
            <label className="admin-field-label">
              Phone
              <input className="admin-field" name="phone" defaultValue="7090720000" />
            </label>
          </div>
        </section>

        <section className="admin-form-card admin-form-card--seo">
          <div className="admin-form-card-head">
            <div>
              <p className="admin-form-seo-kicker mb-1">Search engines</p>
              <h2 className="admin-form-card-title mb-1">Default SEO</h2>
              <p className="admin-form-card-sub mb-0">
                Fallbacks used when a page or item does not set its own meta tags.
              </p>
            </div>
          </div>
          <div className="admin-form-grid">
            <label className="admin-field-label admin-field-span">
              Default meta title
              <input
                className="admin-field"
                name="defaultMetaTitle"
                defaultValue="Education News Network"
                maxLength={70}
              />
            </label>
            <label className="admin-field-label admin-field-span">
              Default meta description
              <textarea
                className="admin-field"
                name="defaultMetaDescription"
                rows={3}
                maxLength={180}
                defaultValue="Independent education journalism from Education News Network — daily news, weekly magazines, panel discussions, summits, and insights for schools, educators, and parents."
              />
            </label>
            <label className="admin-field-label admin-field-span">
              Default keywords
              <input
                className="admin-field"
                name="defaultKeywords"
                defaultValue="education news, ENN, Education Today, school admission, educators summit, panel discussions, K-12 leadership"
              />
            </label>
            <label className="admin-field-label admin-field-span">
              Default Open Graph image URL
              <input className="admin-field" name="defaultOgImage" defaultValue="/images/Enn_logo1.png" />
            </label>
            <label className="admin-field-label">
              Canonical site URL
              <input className="admin-field" name="siteUrl" defaultValue="https://ennnews.com" />
            </label>
            <label className="admin-field-label">
              Twitter / X handle
              <input className="admin-field" name="twitterHandle" defaultValue="@educationtoday" />
            </label>
          </div>
        </section>

        <div className="admin-form-footer-actions">
          <button type="submit" className="btn admin-btn-primary">
            Save settings
          </button>
        </div>
      </form>
    </div>
  );
}
