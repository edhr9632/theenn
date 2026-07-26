"use client";

import AdminFormLayout, { EVENT_CATEGORY_OPTIONS } from "@/components/admin/AdminFormLayout";

export default function AdminSponsorNewPage() {
  return (
    <AdminFormLayout title="Add sponsor" backHref="/admin/sponsors" submitLabel="Save sponsor">
      <label className="admin-field-label">
        Name
        <input className="admin-field" name="name" required />
      </label>
      <label className="admin-field-label">
        Tier
        <input className="admin-field" name="tier" placeholder="Gold Sponsor" />
      </label>
      <label className="admin-field-label">
        Year
        <select className="admin-field" name="year" defaultValue="2026">
          <option>2026</option>
          <option>2025</option>
        </select>
      </label>
      <label className="admin-field-label">
        Category
        <select className="admin-field" name="category" defaultValue={EVENT_CATEGORY_OPTIONS[0]}>
          {EVENT_CATEGORY_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </label>
      <label className="admin-field-label admin-field-span">
        YouTube URL
        <input className="admin-field" name="youtube" />
      </label>
      <label className="admin-field-label admin-field-span">
        Image URL
        <input className="admin-field" name="image" />
      </label>
    </AdminFormLayout>
  );
}
