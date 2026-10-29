import Link from "next/link";
import { notFound } from "next/navigation";
import SiteMasthead from "@/components/SiteMasthead";
import PressBitThumb from "@/components/PressBitThumb";
import { getPressBitBySlug, getPressBitsFromDb } from "@/lib/pressBitsDb";
import { buildPageMetadata } from "@/lib/seo";
import { extractYoutubeId } from "@/lib/videoEmbed";

type PressBytePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PressBytePageProps) {
  const { slug } = await params;
  try {
    const item = await getPressBitBySlug(slug);
    if (!item) {
      return buildPageMetadata({
        title: "Press Byte",
        description: "Press Bytes video from Education News Network events.",
        path: `/events/press-bytes/${slug}`,
      });
    }
    return buildPageMetadata({
      title: `${item.title} — Press Bytes`,
      description: `${item.title} · ${item.year} · ${item.category} — Press Bytes from Education News Network events.`,
      path: `/events/press-bytes/${item.slug}`,
      image: item.image || undefined,
    });
  } catch {
    return buildPageMetadata({
      title: "Press Byte",
      description: "Press Bytes video from Education News Network events.",
      path: `/events/press-bytes/${slug}`,
    });
  }
}

export default async function PressByteDetailPage({ params }: PressBytePageProps) {
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

  const youtubeId = extractYoutubeId(item.videoUrl);

  return (
    <>
      <SiteMasthead activeNav="events" />
      <main className="events-page">
        <section className="events-hero" aria-labelledby="press-byte-heading">
          <div className="container">
            <p className="events-hero-eyebrow text-uppercase mb-2 mb-lg-3">Press Bytes</p>
            <h1 id="press-byte-heading" className="events-hero-title serif-headline mb-3 mb-lg-4">
              {item.title}
            </h1>
            <p className="events-hero-deck mb-0">
              {item.year} · {item.category}
            </p>
          </div>
        </section>

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
              <Link className="events-filter-pill is-active" href="/events/press-bytes" aria-current="page">
                Press Bytes
              </Link>
            </nav>
          </div>
        </div>

        <div className="container py-4 py-lg-5">
          <p className="mb-3">
            <Link href="/events/press-bytes" className="text-decoration-none">
              ← All Press Bytes
            </Link>
          </p>

          <div className="events-press-bit-detail-player rounded-3 overflow-hidden mb-4">
            {youtubeId ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1&playsinline=1`}
                title={item.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <video src={item.videoUrl} controls playsInline poster={item.image || undefined} />
            )}
          </div>

          <div className="mb-5">
            <h2 className="h4 serif-headline mb-2">{item.title}</h2>
            <p className="text-secondary mb-0">
              {item.year} · {item.category}
            </p>
            <p className="small text-secondary mt-2 mb-0">
              Share URL:{" "}
              <code className="user-select-all">/events/press-bytes/{item.slug}</code>
            </p>
          </div>

          {related.length > 0 ? (
            <>
              <h3 className="events-grid-section-title serif-headline mb-3 mb-lg-4">More Press Bytes</h3>
              <div className="row row-cols-2 row-cols-md-3 row-cols-xl-4 g-3 g-lg-4">
                {related.slice(0, 4).map((row) => (
                  <div key={row.id} className="col">
                    <Link
                      href={`/events/press-bytes/${row.slug}`}
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
            </>
          ) : null}
        </div>
      </main>
    </>
  );
}
