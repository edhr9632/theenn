import WeeklyIssueViewer from "@/components/WeeklyIssueViewer";
import { weeklyIssues } from "@/lib/weeklyIssues";
import { buildPageMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return weeklyIssues.map((issue) => ({ slug: issue.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const issue = weeklyIssues.find((item) => item.slug === slug);

  if (!issue) {
    return buildPageMetadata({
      title: "Weekly Edition",
      description: "Education Today weekly magazine PDF edition.",
      path: `/weekly-news/${slug}`,
    });
  }

  return buildPageMetadata({
    title: `${issue.title} — ${issue.dateLabel}`,
    description: `${issue.tagline} Read or download the ${issue.dateLabel} weekly edition from Education News Network.`,
    path: `/weekly-news/${slug}`,
    image: issue.coverImage.startsWith("data:") ? undefined : issue.coverImage,
    keywords: ["weekly education magazine", "Education Today", issue.title, issue.dateLabel],
  });
}

export default async function WeeklyIssuePage({ params }: PageProps) {
  const { slug } = await params;
  return <WeeklyIssueViewer slug={slug} />;
}
