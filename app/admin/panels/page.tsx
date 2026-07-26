"use client";

import { AdminBadge, AdminPageHeader, AdminTable } from "@/components/admin/AdminUi";
import { AdminRowActions } from "@/components/admin/AdminRowActions";
import { panelDiscussions } from "@/lib/data";

export default function AdminPanelsPage() {
  return (
    <div>
      <AdminPageHeader
        title="Panel Discussions"
        description="YouTube panel carousel cards shown on the homepage."
        actionHref="/admin/panels/new"
        actionLabel="+ Add panel"
      />

      <div className="admin-panel">
        <AdminTable columns={["Episode", "Title", "Topic", "Duration", "YouTube", "Actions"]}>
          {panelDiscussions.map((panel) => (
            <tr key={panel.episode}>
              <td>{panel.episode}</td>
              <td>
                <p className="admin-cell-title mb-0">{panel.title}</p>
                <p className="admin-cell-sub mb-0">{panel.speakers}</p>
              </td>
              <td>
                <AdminBadge>{panel.topic}</AdminBadge>
              </td>
              <td>{panel.duration}</td>
              <td>
                <a href={panel.youtube} target="_blank" rel="noopener noreferrer" className="admin-link-btn">
                  Open
                </a>
              </td>
              <td>
                <AdminRowActions editHref={`/admin/panels/edit/${encodeURIComponent(panel.episode)}`} />
              </td>
            </tr>
          ))}
        </AdminTable>
      </div>
    </div>
  );
}
