"use client";

import { useParams } from "next/navigation";
import AdminFormLayout, { EVENT_CATEGORY_OPTIONS } from "@/components/admin/AdminFormLayout";
import { events } from "@/lib/data";

export default function AdminEventEditPage() {
  const params = useParams<{ id: string }>();
  const title = decodeURIComponent(params.id);
  const event = events.find((item) => item.title === title);

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
      <label className="admin-field-label">
        Category
        <select className="admin-field" name="tag" defaultValue={event?.tag ?? EVENT_CATEGORY_OPTIONS[0]}>
          {[event?.tag, ...EVENT_CATEGORY_OPTIONS].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </label>
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
