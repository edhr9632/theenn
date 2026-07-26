"use client";

import { useParams } from "next/navigation";
import AdminFormLayout from "@/components/admin/AdminFormLayout";
import { panelDiscussions } from "@/lib/data";

export default function AdminPanelEditPage() {
  const params = useParams<{ id: string }>();
  const episode = decodeURIComponent(params.id);
  const panel = panelDiscussions.find((item) => item.episode === episode);

  return (
    <AdminFormLayout
      title="Edit panel"
      description={panel ? `Editing ${panel.episode}` : undefined}
      backHref="/admin/panels"
      submitLabel="Update panel"
    >
      <label className="admin-field-label">
        Episode
        <input className="admin-field" name="episode" defaultValue={panel?.episode ?? episode} required />
      </label>
      <label className="admin-field-label">
        Duration
        <input className="admin-field" name="duration" defaultValue={panel?.duration ?? ""} />
      </label>
      <label className="admin-field-label admin-field-span">
        Title
        <input className="admin-field" name="title" defaultValue={panel?.title ?? ""} required />
      </label>
      <label className="admin-field-label">
        Topic
        <input className="admin-field" name="topic" defaultValue={panel?.topic ?? ""} />
      </label>
      <label className="admin-field-label">
        Speakers text
        <input className="admin-field" name="speakers" defaultValue={panel?.speakers ?? ""} />
      </label>
      <label className="admin-field-label admin-field-span">
        YouTube URL
        <input className="admin-field" name="youtube" defaultValue={panel?.youtube ?? ""} />
      </label>
      <label className="admin-field-label admin-field-span">
        Thumbnail URL
        <input className="admin-field" name="image" defaultValue={panel?.image ?? ""} />
      </label>
    </AdminFormLayout>
  );
}
