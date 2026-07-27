export type PodcastShow = {
  slug: string;
  title: string;
  host: string;
  schedule: string;
  description: string;
  image: string;
  imageAlt: string;
  episodes: {
    title: string;
    date: string;
    duration: string;
    summary: string;
  }[];
};

/** Podcast shows will be loaded from the backend/admin — no static dummy shows. */
export const podcastShows: PodcastShow[] = [];

export function getPodcastBySlug(slug: string) {
  return podcastShows.find((show) => show.slug === slug);
}
