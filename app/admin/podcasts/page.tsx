"use client";

import { AdminBadge, AdminPageHeader, AdminTable } from "@/components/admin/AdminUi";
import { AdminRowActions } from "@/components/admin/AdminRowActions";
import { podcastShows } from "@/lib/podcasts";

export default function AdminPodcastsPage() {
  return (
    <div>
      <AdminPageHeader
        title="Podcasts"
        description="Knowledge Plus, ENN Daily Brief, Classroom Voices and their episodes."
        actionHref="/admin/podcasts/new"
        actionLabel="+ Add show"
      />

      <div className="admin-panel">
        <AdminTable columns={["Show", "Host", "Schedule", "Episodes", "Actions"]}>
          {podcastShows.map((show) => (
            <tr key={show.slug}>
              <td>
                <p className="admin-cell-title mb-0">{show.title}</p>
                <p className="admin-cell-sub mb-0">{show.slug}</p>
              </td>
              <td>{show.host}</td>
              <td>{show.schedule}</td>
              <td>
                <AdminBadge tone="blue">{show.episodes.length}</AdminBadge>
              </td>
              <td>
                <AdminRowActions editHref={`/admin/podcasts/edit/${show.slug}`} />
              </td>
            </tr>
          ))}
        </AdminTable>
      </div>
    </div>
  );
}
