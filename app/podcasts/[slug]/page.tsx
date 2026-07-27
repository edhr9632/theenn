import { notFound } from "next/navigation";
import { PodcastPage } from "@/components/PodcastPage";
import { getPodcastBySlug, podcastShows } from "@/lib/podcasts";
import { buildPageMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return podcastShows.map((show) => ({ slug: show.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const show = getPodcastBySlug(slug);
  if (!show) return { title: "Podcast" };
  return buildPageMetadata({
    title: show.title,
    description: show.description,
    path: `/podcasts/${show.slug}`,
    keywords: ["education podcast", show.title, "ENN podcast", show.host],
  });
}

export default async function PodcastShowPage({ params }: PageProps) {
  const { slug } = await params;
  const show = getPodcastBySlug(slug);
  if (!show) notFound();

  return <PodcastPage show={show} podcastActive={slug} />;
}
