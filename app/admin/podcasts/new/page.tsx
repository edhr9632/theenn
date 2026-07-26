"use client";

import AdminFormLayout from "@/components/admin/AdminFormLayout";

export default function AdminPodcastNewPage() {
  return (
    <AdminFormLayout title="Add podcast show" backHref="/admin/podcasts" submitLabel="Save show">
      <label className="admin-field-label">
        Title
        <input className="admin-field" name="title" placeholder="Show title" required />
      </label>
      <label className="admin-field-label">
        Slug
        <input className="admin-field" name="slug" placeholder="show-slug" required />
      </label>
      <label className="admin-field-label">
        Host
        <input className="admin-field" name="host" placeholder="Host name" />
      </label>
      <label className="admin-field-label">
        Schedule
        <input className="admin-field" name="schedule" placeholder="Weekdays · 3:00 PM ET" />
      </label>
      <label className="admin-field-label admin-field-span">
        Description
        <textarea className="admin-field" name="description" rows={3} />
      </label>
    </AdminFormLayout>
  );
}
