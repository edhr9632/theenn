"use client";

import { AdminBadge, AdminPageHeader, AdminTable } from "@/components/admin/AdminUi";
import { AdminRowActions } from "@/components/admin/AdminRowActions";
import { speakers } from "@/lib/data";

export default function AdminSpeakersPage() {
  return (
    <div>
      <AdminPageHeader
        title="Speakers"
        description="Filterable by year and category on the public Speakers page."
        actionHref="/admin/speakers/new"
        actionLabel="+ Add speaker"
      />

      <div className="admin-panel">
        <AdminTable columns={["Name", "Role", "Year", "Category", "YouTube", "Actions"]}>
          {speakers.map((speaker) => (
            <tr key={`${speaker.name}-${speaker.year}`}>
              <td>
                <p className="admin-cell-title mb-0">{speaker.name}</p>
              </td>
              <td>{speaker.role}</td>
              <td>{speaker.year}</td>
              <td>
                <AdminBadge>{speaker.category}</AdminBadge>
              </td>
              <td>
                <a href={speaker.youtube} target="_blank" rel="noopener noreferrer" className="admin-link-btn">
                  Open
                </a>
              </td>
              <td>
                <AdminRowActions
                  editHref={`/admin/speakers/edit/${encodeURIComponent(`${speaker.name}__${speaker.year}`)}`}
                />
              </td>
            </tr>
          ))}
        </AdminTable>
      </div>
    </div>
  );
}
