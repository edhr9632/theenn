import WeeklyIssueViewer from "@/components/WeeklyIssueViewer";
import { buildPageMetadata } from "@/lib/seo";
import { getWeeklyIssueBySlug } from "@/lib/weeklyDb";
import { PAGE_SEO } from "@/lib/seoKeywords";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return [] as { slug: string }[];
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  try {
    const issue = await getWeeklyIssueBySlug(slug);
    if (issue) {
      return buildPageMetadata({
        title: `${issue.title} | ${issue.cityName} Weekly Education Magazine`,
        description:
          issue.tagline ||
          `${issue.title} — Education Today weekly education magazine for ${issue.cityName}. Read and download the PDF on Education News Network.`,
        path: `/weekly-news/${slug}`,
        image: issue.coverImage || undefined,
        keywords: [
          issue.cityName,
          issue.title,
          ...PAGE_SEO.weekly.keywords,
        ],
      });
    }
  } catch {
    /* fall through */
  }

  return buildPageMetadata({
    title: PAGE_SEO.weekly.title,
    description: PAGE_SEO.weekly.description,
    path: `/weekly-news/${slug}`,
    keywords: [...PAGE_SEO.weekly.keywords],
  });
}

export default async function WeeklyIssuePage({ params }: PageProps) {
  const { slug } = await params;
  return <WeeklyIssueViewer slug={slug} />;
}
