import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import SiteMasthead from "@/components/SiteMasthead";
import PressBitThumb from "@/components/PressBitThumb";
import { getPressBitBySlug, getPressBitsFromDb } from "@/lib/pressBitsDb";
import { buildPageMetadata } from "@/lib/seo";
import { extractYoutubeId } from "@/lib/videoEmbed";
import { slugifyPressBit } from "@/lib/pressBitTypes";

type LeaderBytePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: LeaderBytePageProps) {
  const { slug } = await params;
  try {
    const item = await getPressBitBySlug(slug);
    if (!item) {
      return buildPageMetadata({
        title: "Leader Byte",
        description: "Leader Bytes video from Education News Network events.",
        path: `/events/leader-bytes/${slug}`,
      });
    }
    return buildPageMetadata({
      title: `${item.title} - Leader Bytes`,
      description: `${item.title} | ${item.year} | ${item.category} - Leader Bytes from Education News Network events.`,
      path: `/events/leader-bytes/${item.slug}`,
      image: item.image || undefined,
    });
  } catch {
    return buildPageMetadata({
      title: "Leader Byte",
      description: "Leader Bytes video from Education News Network events.",
      path: `/events/leader-bytes/${slug}`,
    });
  }
}

export default async function LeaderByteDetailPage({ params }: LeaderBytePageProps) {
  const { slug } = await params;
  let item = null;
  let related: Awaited<ReturnType<typeof getPressBitsFromDb>> = [];

  try {
    item = await getPressBitBySlug(slug);
    if (item) {
      related = (await getPressBitsFromDb({ year: item.year, limit: 8 })).filter(
        (row) => row.id !== item!.id,
      );
    }
  } catch {
    item = null;
  }

  if (!item) notFound();

  const requested = slugifyPressBit(slug, 120);
  if (requested && item.slug && requested !== item.slug) {
    permanentRedirect(`/events/leader-bytes/${item.slug}`);
  }

  const youtubeId = extractYoutubeId(item.videoUrl);

  return (
    <>
      <SiteMasthead activeNav="events" />
      <main className="events-page press-byte-detail-page">
        <div className="events-filter-bar">
          <div className="container">
            <nav className="d-flex flex-wrap align-items-center gap-2 py-3" aria-label="Event categories">
              <Link className="events-filter-pill" href="/events">
                Featured events
              </Link>
              <Link className="events-filter-pill" href="/events/speakers">
                Speakers
              </Link>
              <Link className="events-filter-pill" href="/events/sponsors">
                Sponsors
              </Link>
              <Link className="events-filter-pill is-active" href="/events/leader-bytes" aria-current="page">
                Leader Bytes
              </Link>
            </nav>
          </div>
        </div>

        <section className="press-byte-detail" aria-labelledby="leader-byte-heading">
          <div className="container">
            <Link href="/events/leader-bytes" className="press-byte-back">
              Back to all Leader Bytes
            </Link>

            <div className="press-byte-stage">
              <div className="press-byte-player-shell">
                <div className="press-byte-player">
                  {youtubeId ? (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1&playsinline=1`}
                      title={item.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={item.videoUrl}
                      controls
                      playsInline
                      poster={item.image || undefined}
                    />
                  )}
                </div>
              </div>

              <div className="press-byte-copy">
                <p className="press-byte-kicker text-uppercase mb-2">Leader Bytes</p>
                <h1 id="leader-byte-heading" className="press-byte-title serif-headline">
                  {item.title}
                </h1>
                <div className="press-byte-meta">
                  <span className="press-byte-chip">{item.year}</span>
                  <span className="press-byte-chip">{item.category}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {related.length > 0 ? (
          <div className="container pb-5">
            <h2 className="events-grid-section-title serif-headline mb-3 mb-lg-4 text-center">
              More Leader Bytes
            </h2>
            <div className="row row-cols-2 row-cols-md-3 row-cols-xl-4 g-3 g-lg-4 justify-content-center">
              {related.slice(0, 4).map((row) => (
                <div key={row.id} className="col">
                  <Link
                    href={`/events/leader-bytes/${row.slug}`}
                    className="events-press-bit-card h-100 d-flex flex-column text-decoration-none"
                  >
                    <div className="events-press-bit-thumb position-relative overflow-hidden rounded-3">
                      <PressBitThumb item={row} />
                    </div>
                    <div className="pt-3 d-flex flex-column flex-grow-1">
                      <h3 className="events-press-bit-title mb-1">{row.title}</h3>
                      <p className="events-press-bit-meta small mb-0">
                        {row.year} · {row.category}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </main>
    </>
  );
}
