"use client";

import { AdminBadge, AdminPageHeader, AdminTable } from "@/components/admin/AdminUi";
import { AdminRowActions } from "@/components/admin/AdminRowActions";
import { events } from "@/lib/data";

export default function AdminEventsPage() {
  return (
    <div>
      <AdminPageHeader
        title="Events"
        description="Featured events shown on /events."
        actionHref="/admin/events/new"
        actionLabel="+ Add event"
      />

      <div className="admin-panel">
        <AdminTable columns={["Title", "Category", "Date", "Location", "Actions"]}>
          {events.map((event) => (
            <tr key={event.title}>
              <td>
                <p className="admin-cell-title mb-0">{event.title}</p>
              </td>
              <td>
                <AdminBadge>{event.tag}</AdminBadge>
              </td>
              <td>{event.date}</td>
              <td>{event.location}</td>
              <td>
                <AdminRowActions editHref={`/admin/events/edit/${encodeURIComponent(event.title)}`} />
              </td>
            </tr>
          ))}
        </AdminTable>
      </div>
    </div>
  );
}
