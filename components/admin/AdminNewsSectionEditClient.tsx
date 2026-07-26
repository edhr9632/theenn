"use client";

import { useRouter } from "next/navigation";
import AdminFormLayout from "@/components/admin/AdminFormLayout";
import AdminArticleFields from "@/components/admin/AdminArticleFields";
import { submitAdminArticleForm } from "@/lib/adminNewsSubmit";
import type { NewsArticle } from "@/lib/data";
import type { NewsSection } from "@/lib/newsTypes";

type AdminNewsSectionEditClientProps = {
  section: NewsSection;
  slug: string;
  meta: {
    title: string;
    back: string;
    label: string;
    editPrefix: string;
  };
  article: NewsArticle | null;
  content?: string;
  featuredVideo?: string;
  imageUrl?: string;
};

export default function AdminNewsSectionEditClient({
  section,
  slug,
  meta,
  article,
  content = "",
  featuredVideo = "",
  imageUrl = "",
}: AdminNewsSectionEditClientProps) {
  const router = useRouter();

  return (
    <AdminFormLayout
      title={meta.title}
      description={article ? `Editing “${article.title}”` : "Update this story."}
      backHref={meta.back}
      submitLabel="Update article"
      wide
      cardSubtitle={`${meta.label} · saved to PostgreSQL`}
      seoDefaults={{
        metaTitle: article?.title,
        metaDescription: article?.excerpt,
        metaKeywords: article ? `${article.category}, education news, ENN` : undefined,
        ogImage: article?.image,
      }}
      onSubmit={async (event) => {
        const ok = await submitAdminArticleForm(event, "update", slug);
        if (ok) router.push(meta.back);
      }}
    >
      <input type="hidden" name="newsSection" value={section} />
      <AdminArticleFields
        defaults={{
          title: article?.title,
          slug: article?.slug ?? slug,
          category: article?.category ?? "Education",
          author: article?.author,
          excerpt: article?.excerpt,
          image: imageUrl || (article?.image?.includes("img.youtube.com") ? "" : article?.image),
          featuredVideo,
          status: "published",
          content: content || (article ? `<p>${article.excerpt}</p>` : ""),
        }}
      />
    </AdminFormLayout>
  );
}
