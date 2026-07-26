"use client";

import { useParams } from "next/navigation";
import AdminFormLayout, { EVENT_CATEGORY_OPTIONS } from "@/components/admin/AdminFormLayout";
import { sponsors } from "@/lib/data";

export default function AdminSponsorEditPage() {
  const params = useParams<{ id: string }>();
  const decoded = decodeURIComponent(params.id);
  const [namePart, yearPart] = decoded.split("__");
  const sponsor = sponsors.find((item) => item.name === namePart && String(item.year) === yearPart);

  return (
    <AdminFormLayout
      title="Edit sponsor"
      description={sponsor ? `Editing ${sponsor.name}` : undefined}
      backHref="/admin/sponsors"
      submitLabel="Update sponsor"
    >
      <label className="admin-field-label">
        Name
        <input className="admin-field" name="name" defaultValue={sponsor?.name ?? namePart} required />
      </label>
      <label className="admin-field-label">
        Tier
        <input className="admin-field" name="tier" defaultValue={sponsor?.tier ?? ""} />
      </label>
      <label className="admin-field-label">
        Year
        <select className="admin-field" name="year" defaultValue={String(sponsor?.year ?? yearPart ?? "2026")}>
          <option>2026</option>
          <option>2025</option>
        </select>
      </label>
      <label className="admin-field-label">
        Category
        <select className="admin-field" name="category" defaultValue={sponsor?.category ?? EVENT_CATEGORY_OPTIONS[0]}>
          {EVENT_CATEGORY_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </label>
      <label className="admin-field-label admin-field-span">
        YouTube URL
        <input className="admin-field" name="youtube" defaultValue={sponsor?.youtube ?? ""} />
      </label>
      <label className="admin-field-label admin-field-span">
        Image URL
        <input className="admin-field" name="image" defaultValue={sponsor?.image ?? ""} />
      </label>
    </AdminFormLayout>
  );
}
