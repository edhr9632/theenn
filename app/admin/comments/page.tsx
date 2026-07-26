"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AdminBadge, AdminPageHeader, AdminTable } from "@/components/admin/AdminUi";
import type { AdminArticleComment } from "@/lib/commentTypes";

type FilterStatus = "pending" | "approved" | "rejected" | "all";

function formatDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminCommentsPage() {
  const [filter, setFilter] = useState<FilterStatus>("pending");
  const [items, setItems] = useState<AdminArticleComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [dbError, setDbError] = useState(false);

  const loadItems = useCallback(async (status: FilterStatus) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/comments?status=${encodeURIComponent(status)}`);
      const data = (await response.json()) as { items?: AdminArticleComment[]; error?: string };
      if (!response.ok) {
        setDbError(true);
        setItems([]);
        return;
      }
      setDbError(false);
      setItems(data.items ?? []);
    } catch {
      setDbError(true);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadItems(filter);
  }, [filter, loadItems]);

  const flash = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2200);
  };

  const setStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      const response = await fetch(`/api/admin/comments/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        window.alert("Could not update comment.");
        return;
      }
      flash(status === "approved" ? "Comment approved" : "Comment rejected");
      await loadItems(filter);
    } catch {
      window.alert("Network error.");
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this comment permanently?")) return;
    try {
      const response = await fetch(`/api/admin/comments/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!response.ok) {
        window.alert("Could not delete comment.");
        return;
      }
      flash("Comment deleted");
      await loadItems(filter);
    } catch {
      window.alert("Network error.");
    }
  };

  const pendingCount = filter === "pending" ? items.length : null;

  return (
    <div>
      <AdminPageHeader
        title="Comments"
        description="Review reader comments before they appear on article pages. Approve or reject pending submissions."
      />

      {message ? <p className="admin-flash mb-3">{message}</p> : null}

      {dbError ? (
        <div className="admin-panel mb-3 p-4">
          <p className="mb-0 text-danger">
            Could not load comments from PostgreSQL. Check <code>DATABASE_URL</code>.
          </p>
        </div>
      ) : null}

      <div className="admin-panel mb-3">
        <div className="d-flex flex-wrap gap-2 align-items-center">
          {(
            [
              ["pending", "Pending approval"],
              ["approved", "Approved"],
              ["rejected", "Rejected"],
              ["all", "All comments"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`btn btn-sm ${filter === key ? "admin-btn-primary" : "admin-btn-ghost"}`}
              onClick={() => setFilter(key)}
            >
              {label}
              {key === "pending" && pendingCount !== null ? ` (${pendingCount})` : ""}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-panel">
        <AdminTable columns={["Article / post", "Commenter", "Comment", "Submitted", "Status", "Actions"]}>
          {loading ? (
            <tr>
              <td colSpan={6}>
                <p className="mb-0 text-muted py-3">Loading comments…</p>
              </td>
            </tr>
          ) : items.length ? (
            items.map((item) => (
              <tr key={item.id}>
                <td>
                  <p className="admin-cell-title mb-0">{item.articleTitle}</p>
                  <p className="admin-cell-sub mb-0">
                    <Link href={`/news/${item.articleSlug}`} target="_blank" className="admin-inline-link">
                      /news/{item.articleSlug}
                    </Link>
                  </p>
                </td>
                <td>
                  <p className="admin-cell-title mb-0">{item.authorName}</p>
                  <p className="admin-cell-sub mb-0">{item.authorEmail || "No email"}</p>
                </td>
                <td style={{ maxWidth: "18rem" }}>
                  <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
                    {item.body}
                  </p>
                </td>
                <td>{formatDate(item.createdAt)}</td>
                <td>
                  <AdminBadge
                    tone={
                      item.status === "approved" ? "green" : item.status === "pending" ? "orange" : "gray"
                    }
                  >
                    {item.status}
                  </AdminBadge>
                </td>
                <td>
                  <div className="admin-row-actions flex-wrap">
                    {item.status !== "approved" ? (
                      <button
                        type="button"
                        className="btn admin-btn-primary btn-sm"
                        onClick={() => void setStatus(item.id, "approved")}
                      >
                        Approve
                      </button>
                    ) : null}
                    {item.status !== "rejected" ? (
                      <button
                        type="button"
                        className="btn admin-btn-ghost btn-sm"
                        onClick={() => void setStatus(item.id, "rejected")}
                      >
                        Reject
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="btn admin-btn-ghost btn-sm text-danger"
                      onClick={() => void remove(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6}>
                <p className="mb-0 text-muted py-3">
                  {filter === "pending"
                    ? "No comments waiting for approval."
                    : "No comments in this filter."}
                </p>
              </td>
            </tr>
          )}
        </AdminTable>
      </div>
    </div>
  );
}
