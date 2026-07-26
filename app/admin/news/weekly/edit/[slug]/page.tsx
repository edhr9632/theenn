"use client";

import { useParams } from "next/navigation";
import { Suspense } from "react";
import AdminWeeklyIssueForm from "@/components/admin/AdminWeeklyIssueForm";

function EditInner() {
  const params = useParams<{ slug: string }>();
  return <AdminWeeklyIssueForm mode="edit" slug={decodeURIComponent(params.slug)} />;
}

export default function AdminWeeklyEditPage() {
  return (
    <Suspense fallback={<p className="admin-empty mb-0">Loading…</p>}>
      <EditInner />
    </Suspense>
  );
}
