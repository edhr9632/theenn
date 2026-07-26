"use client";

import { Suspense } from "react";
import AdminWeeklyIssueForm from "@/components/admin/AdminWeeklyIssueForm";

export default function AdminWeeklyNewPage() {
  return (
    <Suspense fallback={<p className="admin-empty mb-0">Loading…</p>}>
      <AdminWeeklyIssueForm mode="new" />
    </Suspense>
  );
}
