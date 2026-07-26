"use client";

import { AdminBadge, AdminEmpty, AdminPageHeader, AdminTable } from "@/components/admin/AdminUi";
import { AdminRowActions } from "@/components/admin/AdminRowActions";

const demoMessages = [
  {
    id: "1",
    name: "Sarah Mitchell",
    email: "sarah@example.com",
    subject: "Partnership inquiry",
    phone: "+1 555 0102",
    date: "Jul 8, 2026",
    status: "New",
  },
  {
    id: "2",
    name: "James Okonkwo",
    email: "james@school.edu",
    subject: "Story tip — rural teacher housing",
    phone: "",
    date: "Jul 7, 2026",
    status: "Read",
  },
];

export default function AdminContactsPage() {
  return (
    <div>
      <AdminPageHeader
        title="Contact messages"
        description="Inbox from the Contact Us form. Replace demo rows with your backend later."
      />

      <div className="admin-panel">
        {demoMessages.length === 0 ? (
          <AdminEmpty message="No messages yet." />
        ) : (
          <AdminTable columns={["From", "Subject", "Phone", "Date", "Status", "Actions"]}>
            {demoMessages.map((msg) => (
              <tr key={msg.id}>
                <td>
                  <p className="admin-cell-title mb-0">{msg.name}</p>
                  <p className="admin-cell-sub mb-0">{msg.email}</p>
                </td>
                <td>{msg.subject}</td>
                <td>{msg.phone || "—"}</td>
                <td>{msg.date}</td>
                <td>
                  <AdminBadge tone={msg.status === "New" ? "orange" : "gray"}>{msg.status}</AdminBadge>
                </td>
                <td>
                  <AdminRowActions deleteLabel="Delete message" />
                </td>
              </tr>
            ))}
          </AdminTable>
        )}
      </div>
    </div>
  );
}
