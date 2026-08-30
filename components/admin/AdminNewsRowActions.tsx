"use client";

import { useRouter } from "next/navigation";
import { AdminRowActions } from "@/components/admin/AdminRowActions";

type AdminNewsRowActionsProps = {
  slug: string;
  title: string;
  editHref: string;
};

export default function AdminNewsRowActions({ slug, title, editHref }: AdminNewsRowActionsProps) {
  const router = useRouter();

  const onDelete = async () => {
    if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) return;
    try {
      const response = await fetch(`/api/admin/news/${encodeURIComponent(slug)}`, { method: "DELETE" });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        window.alert(data.error ?? "Could not delete this article.");
        return;
      }
      router.refresh();
    } catch {
      window.alert("Network error. Could not delete this article.");
    }
  };

  return <AdminRowActions editHref={editHref} onDelete={() => void onDelete()} deleteLabel="Delete article" />;
}
