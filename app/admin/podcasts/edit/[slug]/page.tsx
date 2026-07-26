"use client";

import { useParams } from "next/navigation";
import AdminFormLayout from "@/components/admin/AdminFormLayout";
import { podcastShows } from "@/lib/podcasts";

export default function AdminPodcastEditPage() {
  const params = useParams<{ slug: string }>();
  const show = podcastShows.find((item) => item.slug === params.slug);

  return (
    <AdminFormLayout
      title="Edit podcast show"
      description={show ? `Editing “${show.title}”` : undefined}
      backHref="/admin/podcasts"
      submitLabel="Update show"
    >
      <label className="admin-field-label">
        Title
        <input className="admin-field" name="title" defaultValue={show?.title ?? ""} required />
      </label>
      <label className="admin-field-label">
        Slug
        <input className="admin-field" name="slug" defaultValue={show?.slug ?? params.slug} required />
      </label>
      <label className="admin-field-label">
        Host
        <input className="admin-field" name="host" defaultValue={show?.host ?? ""} />
      </label>
      <label className="admin-field-label">
        Schedule
        <input className="admin-field" name="schedule" defaultValue={show?.schedule ?? ""} />
      </label>
      <label className="admin-field-label admin-field-span">
        Description
        <textarea className="admin-field" name="description" rows={3} defaultValue={show?.description ?? ""} />
      </label>
    </AdminFormLayout>
  );
}
