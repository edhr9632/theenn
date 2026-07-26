"use client";

import AdminFormLayout from "@/components/admin/AdminFormLayout";

export default function AdminPanelNewPage() {
  return (
    <AdminFormLayout title="Add panel" backHref="/admin/panels" submitLabel="Save panel">
      <label className="admin-field-label">
        Episode
        <input className="admin-field" name="episode" placeholder="EP 06" required />
      </label>
      <label className="admin-field-label">
        Duration
        <input className="admin-field" name="duration" placeholder="48:12" />
      </label>
      <label className="admin-field-label admin-field-span">
        Title
        <input className="admin-field" name="title" placeholder="Panel title" required />
      </label>
      <label className="admin-field-label">
        Topic
        <input className="admin-field" name="topic" placeholder="Policy" />
      </label>
      <label className="admin-field-label">
        Speakers text
        <input className="admin-field" name="speakers" placeholder="Panel of…" />
      </label>
      <label className="admin-field-label admin-field-span">
        YouTube URL
        <input className="admin-field" name="youtube" placeholder="https://www.youtube.com/watch?v=..." />
      </label>
      <label className="admin-field-label admin-field-span">
        Thumbnail URL
        <input className="admin-field" name="image" placeholder="https://..." />
      </label>
    </AdminFormLayout>
  );
}
