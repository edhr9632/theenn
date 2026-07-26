"use client";

import { useParams } from "next/navigation";
import AdminFormLayout, { EVENT_CATEGORY_OPTIONS } from "@/components/admin/AdminFormLayout";
import { speakers } from "@/lib/data";

export default function AdminSpeakerEditPage() {
  const params = useParams<{ id: string }>();
  const decoded = decodeURIComponent(params.id);
  const [namePart, yearPart] = decoded.split("__");
  const speaker = speakers.find((item) => item.name === namePart && String(item.year) === yearPart);

  return (
    <AdminFormLayout
      title="Edit speaker"
      description={speaker ? `Editing ${speaker.name}` : undefined}
      backHref="/admin/speakers"
      submitLabel="Update speaker"
    >
      <label className="admin-field-label">
        Name
        <input className="admin-field" name="name" defaultValue={speaker?.name ?? namePart} required />
      </label>
      <label className="admin-field-label">
        Year
        <select className="admin-field" name="year" defaultValue={String(speaker?.year ?? yearPart ?? "2026")}>
          <option>2026</option>
          <option>2025</option>
        </select>
      </label>
      <label className="admin-field-label admin-field-span">
        Role
        <input className="admin-field" name="role" defaultValue={speaker?.role ?? ""} />
      </label>
      <label className="admin-field-label">
        Category
        <select className="admin-field" name="category" defaultValue={speaker?.category ?? EVENT_CATEGORY_OPTIONS[0]}>
          {EVENT_CATEGORY_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </label>
      <label className="admin-field-label">
        YouTube URL
        <input className="admin-field" name="youtube" defaultValue={speaker?.youtube ?? ""} />
      </label>
      <label className="admin-field-label admin-field-span">
        Image URL
        <input className="admin-field" name="image" defaultValue={speaker?.image ?? ""} />
      </label>
    </AdminFormLayout>
  );
}
