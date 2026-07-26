"use client";

import AdminFormLayout, { EVENT_CATEGORY_OPTIONS } from "@/components/admin/AdminFormLayout";

export default function AdminEventNewPage() {
  return (
    <AdminFormLayout title="Add event" backHref="/admin/events" submitLabel="Save event">
      <label className="admin-field-label admin-field-span">
        Title
        <input className="admin-field" name="title" required />
      </label>
      <label className="admin-field-label">
        Category
        <select className="admin-field" name="tag" defaultValue={EVENT_CATEGORY_OPTIONS[0]}>
          {EVENT_CATEGORY_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </label>
      <label className="admin-field-label">
        Date
        <input className="admin-field" name="date" placeholder="September 10, 2026" />
      </label>
      <label className="admin-field-label admin-field-span">
        Location
        <input className="admin-field" name="location" />
      </label>
      <label className="admin-field-label admin-field-span">
        Excerpt
        <textarea className="admin-field" name="excerpt" rows={3} />
      </label>
    </AdminFormLayout>
  );
}
