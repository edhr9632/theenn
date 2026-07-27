import WeeklyIssueViewer from "@/components/WeeklyIssueViewer";
import { buildPageMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return [] as { slug: string }[];
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  return buildPageMetadata({
    title: "Weekly Edition",
    description: "Education Today weekly magazine PDF edition.",
    path: `/weekly-news/${slug}`,
  });
}

export default async function WeeklyIssuePage({ params }: PageProps) {
  const { slug } = await params;
  return <WeeklyIssueViewer slug={slug} />;
}
