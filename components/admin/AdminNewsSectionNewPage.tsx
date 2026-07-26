"use client";

import { useRouter } from "next/navigation";
import AdminFormLayout from "@/components/admin/AdminFormLayout";
import AdminArticleFields from "@/components/admin/AdminArticleFields";
import { submitAdminArticleForm } from "@/lib/adminNewsSubmit";
import type { NewsSection } from "@/lib/newsTypes";

const SECTION_COPY: Record<
  NewsSection,
  { title: string; back: string; label: string }
> = {
  top_education: {
    title: "Add top education article",
    back: "/admin/news/top-education",
    label: "Top Education News",
  },
  daily: { title: "Add daily article", back: "/admin/news/daily", label: "Daily News" },
  trending: { title: "Add trending article", back: "/admin/news/trending", label: "Trending News" },
  press: { title: "Add press release", back: "/admin/news/press", label: "Press Release" },
};

export default function AdminNewsSectionNewPage({ section }: { section: NewsSection }) {
  const router = useRouter();
  const meta = SECTION_COPY[section];

  return (
    <AdminFormLayout
      title={meta.title}
      description={`Create a new ${meta.label} story with the WordPress-style editor.`}
      backHref={meta.back}
      submitLabel="Publish article"
      wide
      cardSubtitle={`${meta.label} · saved to PostgreSQL`}
      onSubmit={async (event) => {
        const ok = await submitAdminArticleForm(event, "create");
        if (ok) router.push(meta.back);
      }}
    >
      <input type="hidden" name="newsSection" value={section} />
      <AdminArticleFields defaults={{ category: "Education", status: "published" }} />
    </AdminFormLayout>
  );
}
