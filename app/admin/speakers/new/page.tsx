"use client";

import AdminFormLayout, { EVENT_CATEGORY_OPTIONS } from "@/components/admin/AdminFormLayout";

export default function AdminSpeakerNewPage() {
  return (
    <AdminFormLayout title="Add speaker" backHref="/admin/speakers" submitLabel="Save speaker">
      <label className="admin-field-label">
        Name
        <input className="admin-field" name="name" required />
      </label>
      <label className="admin-field-label">
        Year
        <select className="admin-field" name="year" defaultValue="2026">
          <option>2026</option>
          <option>2025</option>
        </select>
      </label>
      <label className="admin-field-label admin-field-span">
        Role
        <input className="admin-field" name="role" />
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
      <label className="admin-field-label">
        YouTube URL
        <input className="admin-field" name="youtube" placeholder="https://www.youtube.com/..." />
      </label>
      <label className="admin-field-label admin-field-span">
        Image URL
        <input className="admin-field" name="image" />
      </label>
    </AdminFormLayout>
  );
}
