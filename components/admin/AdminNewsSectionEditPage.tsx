import AdminFormLayout from "@/components/admin/AdminFormLayout";
import AdminNewsSectionEditClient from "@/components/admin/AdminNewsSectionEditClient";
import { getNewsBySlug, mapNewsArticleRow, type NewsSection } from "@/lib/newsDb";

const SECTION_COPY: Record<
  NewsSection,
  { title: string; back: string; label: string; editPrefix: string }
> = {
  top_education: {
    title: "Edit top education article",
    back: "/admin/news/top-education",
    label: "Top Education News",
    editPrefix: "/admin/news/top-education/edit",
  },
  daily: {
    title: "Edit daily article",
    back: "/admin/news/daily",
    label: "Daily News",
    editPrefix: "/admin/news/daily/edit",
  },
  trending: {
    title: "Edit trending article",
    back: "/admin/news/trending",
    label: "Trending News",
    editPrefix: "/admin/news/trending/edit",
  },
  press: {
    title: "Edit press release",
    back: "/admin/news/press",
    label: "Press Release",
    editPrefix: "/admin/news/press/edit",
  },
};

export default async function AdminNewsSectionEditPage({
  section,
  slug,
}: {
  section: NewsSection;
  slug: string;
}) {
  const meta = SECTION_COPY[section];
  let article = null;
  let content = "";
  let featuredVideo = "";
  let imageUrl = "";

  try {
    const row = await getNewsBySlug(slug);
    if (row) {
      article = mapNewsArticleRow(row);
      content = row.content ?? "";
      featuredVideo = row.featured_video?.trim() ?? "";
      imageUrl = row.image_url?.trim() ?? "";
    }
  } catch {
    /* db unavailable */
  }

  return (
    <AdminNewsSectionEditClient
      section={section}
      slug={slug}
      meta={meta}
      article={article}
      content={content}
      featuredVideo={featuredVideo}
      imageUrl={imageUrl}
    />
  );
}
