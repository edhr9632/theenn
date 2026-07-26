"use client";

import { AdminBadge, AdminPageHeader, AdminTable } from "@/components/admin/AdminUi";
import { AdminRowActions } from "@/components/admin/AdminRowActions";
import { sponsors } from "@/lib/data";

export default function AdminSponsorsPage() {
  return (
    <div>
      <AdminPageHeader
        title="Sponsors"
        description="Filterable by year and category. Cards open YouTube videos."
        actionHref="/admin/sponsors/new"
        actionLabel="+ Add sponsor"
      />

      <div className="admin-panel">
        <AdminTable columns={["Name", "Tier", "Year", "Category", "YouTube", "Actions"]}>
          {sponsors.map((sponsor) => (
            <tr key={`${sponsor.name}-${sponsor.year}`}>
              <td>
                <p className="admin-cell-title mb-0">{sponsor.name}</p>
              </td>
              <td>{sponsor.tier}</td>
              <td>{sponsor.year}</td>
              <td>
                <AdminBadge>{sponsor.category}</AdminBadge>
              </td>
              <td>
                <a href={sponsor.youtube} target="_blank" rel="noopener noreferrer" className="admin-link-btn">
                  Open
                </a>
              </td>
              <td>
                <AdminRowActions
                  editHref={`/admin/sponsors/edit/${encodeURIComponent(`${sponsor.name}__${sponsor.year}`)}`}
                />
              </td>
            </tr>
          ))}
        </AdminTable>
      </div>
    </div>
  );
}
