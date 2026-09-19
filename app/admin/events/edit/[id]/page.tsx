"use client";

import { useParams } from "next/navigation";
import AdminFormLayout from "@/components/admin/AdminFormLayout";
import AdminYearCategoryFields from "@/components/admin/AdminYearCategoryFields";
import { events } from "@/lib/data";

function inferYearFromTag(tag?: string) {
  const match = tag?.match(/(20\d{2})\s*$/);
  return match ? Number(match[1]) : 2026;
}

export default function AdminEventEditPage() {
  const params = useParams<{ id: string }>();
  const title = decodeURIComponent(params.id);
  const event = events.find((item) => item.title === title);
  const defaultYear = inferYearFromTag(event?.tag);

  return (
    <AdminFormLayout
      title="Edit event"
      description={event ? `Editing “${event.title}”` : undefined}
      backHref="/admin/events"
      submitLabel="Update event"
    >
      <label className="admin-field-label admin-field-span">
        Title
        <input className="admin-field" name="title" defaultValue={event?.title ?? title} required />
      </label>
      <AdminYearCategoryFields
        categoryName="tag"
        defaultYear={defaultYear}
        defaultCategory={event?.tag}
      />
      <label className="admin-field-label">
        Date
        <input className="admin-field" name="date" defaultValue={event?.date ?? ""} />
      </label>
      <label className="admin-field-label admin-field-span">
        Location
        <input className="admin-field" name="location" defaultValue={event?.location ?? ""} />
      </label>
      <label className="admin-field-label admin-field-span">
        Excerpt
        <textarea className="admin-field" name="excerpt" rows={3} defaultValue={event?.excerpt ?? ""} />
      </label>
    </AdminFormLayout>
  );
}
