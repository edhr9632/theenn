"use client";

import Link from "next/link";
import type { FormEvent, ReactNode } from "react";
import { AdminBadge, AdminPageHeader } from "@/components/admin/AdminUi";

type AdminFormLayoutProps = {
  title: string;
  description?: string;
  backHref: string;
  backLabel?: string;
  children: ReactNode;
  submitLabel?: string;
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
  showSeo?: boolean;
  wide?: boolean;
  cardSubtitle?: string;
  seoDefaults?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    ogImage?: string;
  };
};

export default function AdminFormLayout({
  title,
  description,
  backHref,
  backLabel = "← Back to list",
  children,
  submitLabel = "Save",
  onSubmit,
  showSeo = true,
  wide = true,
  cardSubtitle = "Fill in the details below. Required fields are marked.",
  seoDefaults,
}: AdminFormLayoutProps) {
  return (
    <div className={`admin-form-page${wide ? " admin-form-page--wide" : ""}`}>
      <AdminPageHeader title={title} description={description} />
      <p className="mb-3">
        <Link href={backHref} className="admin-back-link">
          {backLabel}
        </Link>
      </p>

      <form
        className="admin-form-shell"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit?.(e);
        }}
      >
        <section className="admin-form-card">
          <div className="admin-form-card-head">
            <div>
              <h2 className="admin-form-card-title mb-1">{title}</h2>
              <p className="admin-form-card-sub mb-0">{cardSubtitle}</p>
            </div>
            <AdminBadge tone="green">PostgreSQL</AdminBadge>
          </div>
          <div className="admin-form-grid">{children}</div>
        </section>

        {showSeo ? (
          <section className="admin-form-card admin-form-card--seo">
            <div className="admin-form-card-head">
              <div>
                <p className="admin-form-seo-kicker mb-1">Search engines</p>
                <h2 className="admin-form-card-title mb-1">SEO settings</h2>
                <p className="admin-form-card-sub mb-0">
                  Meta title, description, keywords, and social preview image for this item.
                </p>
              </div>
            </div>
            <div className="admin-form-grid">
              <label className="admin-field-label admin-field-span">
                Meta title
                <input
                  className="admin-field"
                  name="metaTitle"
                  defaultValue={seoDefaults?.metaTitle ?? ""}
                  placeholder="SEO page title (50–60 characters)"
                  maxLength={70}
                />
              </label>
              <label className="admin-field-label admin-field-span">
                Meta description
                <textarea
                  className="admin-field"
                  name="metaDescription"
                  rows={3}
                  defaultValue={seoDefaults?.metaDescription ?? ""}
                  placeholder="Short summary for Google results (140–160 characters)"
                  maxLength={180}
                />
              </label>
              <label className="admin-field-label admin-field-span">
                Meta keywords
                <input
                  className="admin-field"
                  name="metaKeywords"
                  defaultValue={seoDefaults?.metaKeywords ?? ""}
                  placeholder="education, schools, summit, india"
                />
              </label>
              <label className="admin-field-label admin-field-span">
                Open Graph / social image URL
                <input
                  className="admin-field"
                  name="ogImage"
                  defaultValue={seoDefaults?.ogImage ?? ""}
                  placeholder="https://…/share-image.jpg"
                />
              </label>
              <label className="admin-field-label">
                Canonical URL
                <input className="admin-field" name="canonicalUrl" placeholder="https://yoursite.com/…" />
              </label>
              <label className="admin-field-label">
                Robots
                <select className="admin-field" name="robots" defaultValue="index,follow">
                  <option value="index,follow">Index, Follow</option>
                  <option value="noindex,follow">Noindex, Follow</option>
                  <option value="index,nofollow">Index, Nofollow</option>
                  <option value="noindex,nofollow">Noindex, Nofollow</option>
                </select>
              </label>
            </div>
          </section>
        ) : null}

        <div className="admin-form-footer-actions">
          <Link href={backHref} className="btn admin-btn-ghost">
            Cancel
          </Link>
          <button type="submit" className="btn admin-btn-primary">
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

export const EVENT_CATEGORY_OPTIONS = [
  "North Educators' Summit & Awards",
  "Maharashtra Educators' Summit & Awards",
  "South India Educators' Summit",
  "14th National Conference on K-12 Leadership",
  "Maharashtra & North Educators' Summit & Awards",
  "13th National Conference on K-12 Leadership",
  "Bengaluru Leadership Roundtable",
] as const;
