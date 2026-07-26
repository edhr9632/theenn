import Link from "next/link";
import Image from "next/image";
import SiteMasthead from "@/components/SiteMasthead";
import PodcastEpisodePlayer from "@/components/PodcastEpisodePlayer";
import { podcastShows, type PodcastShow } from "@/lib/podcasts";

const filters = [
  { href: "/podcasts/knowledge-plus", label: "Knowledge Plus", key: "knowledge-plus" },
  { href: "/podcasts/enn-daily-brief", label: "ENN Daily Brief", key: "enn-daily-brief" },
  { href: "/podcasts/classroom-voices", label: "Classroom Voices", key: "classroom-voices" },
] as const;

type PodcastPageProps = {
  show: PodcastShow;
  podcastActive: (typeof filters)[number]["key"];
};

export function PodcastPage({ show, podcastActive }: PodcastPageProps) {
  return (
    <>
      <SiteMasthead activeNav="podcasts" podcastActive={podcastActive} />
      <main className="podcast-page">
        <section className="podcast-hero" aria-labelledby="podcast-hero-heading">
          <div className="container">
            <p className="podcast-hero-eyebrow text-uppercase mb-2 mb-lg-3">Podcasts</p>
            <h1 id="podcast-hero-heading" className="podcast-hero-title serif-headline mb-3 mb-lg-4">
              {show.title}
            </h1>
            <p className="podcast-hero-deck mb-0">{show.description}</p>
          </div>
        </section>

        <div className="podcast-filter-bar">
          <div className="container">
            <nav className="d-flex flex-wrap align-items-center gap-1 gap-md-2 py-1" aria-label="Podcast shows">
              {filters.map((filter) => (
                <Link
                  key={filter.key}
                  className={`podcast-filter-pill${podcastActive === filter.key ? " is-active" : ""}`}
                  href={filter.href}
                  aria-current={podcastActive === filter.key ? "page" : undefined}
                >
                  {filter.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="container py-4 py-lg-5">
          <div className="row g-4 g-lg-5 align-items-start">
            <div className="col-lg-5">
              <article className="podcast-show-card bg-white rounded-3 shadow-sm overflow-hidden">
                <div className="ratio ratio-4x3 position-relative">
                  <Image src={show.image} alt={show.imageAlt} fill className="object-fit-cover" sizes="(max-width:992px) 100vw, 40vw" priority />
                </div>
                <div className="p-4">
                  <p className="podcast-show-meta small text-uppercase fw-semibold mb-2">Hosted by {show.host}</p>
                  <p className="podcast-show-schedule mb-0 fw-semibold">{show.schedule}</p>
                </div>
              </article>
            </div>

            <div className="col-lg-7">
              <header className="podcast-list-header mb-4 pb-2 border-bottom border-secondary border-opacity-25">
                <h2 className="podcast-list-title serif-headline mb-2">Latest episodes</h2>
                <p className="podcast-list-sub text-secondary mb-0">Listen to recent conversations from {show.title}.</p>
              </header>

              <div className="d-flex flex-column gap-4">
                {show.episodes.map((episode) => (
                  <article key={episode.title} className="podcast-episode-card">
                    <PodcastEpisodePlayer showTitle={show.title} host={show.host} episode={episode} />
                    <p className="podcast-episode-date small text-muted mt-2 mb-0 px-1">{episode.date}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export function getPodcastStaticParams() {
  return podcastShows.map((show) => ({ slug: show.slug }));
}
