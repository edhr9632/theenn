"use client";

import AdminFormLayout from "@/components/admin/AdminFormLayout";
import AdminYearCategoryFields from "@/components/admin/AdminYearCategoryFields";

export default function AdminEventNewPage() {
  return (
    <AdminFormLayout title="Add event" backHref="/admin/events" submitLabel="Save event">
      <label className="admin-field-label admin-field-span">
        Title
        <input className="admin-field" name="title" required />
      </label>
      <AdminYearCategoryFields categoryName="tag" defaultYear={2026} />
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
