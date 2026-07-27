import Link from "next/link";
import Image from "next/image";
import SiteMasthead from "@/components/SiteMasthead";
import ComingSoonBlock from "@/components/ComingSoonBlock";
import { events } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Events",
  description:
    "Educators’ summits, workshops, and live conversations from Education News Network — connect with policymakers and school leaders.",
  path: "/events",
  keywords: ["educators summit", "education events india", "K-12 conference", "ENN events"],
});

export default function EventsPage() {
  return (
    <>
      <SiteMasthead activeNav="events" />
      <main className="events-page">
        <section className="events-hero" aria-labelledby="events-hero-heading">
          <div className="container">
            <p className="events-hero-eyebrow text-uppercase mb-2 mb-lg-3">Events</p>
            <h1 id="events-hero-heading" className="events-hero-title serif-headline mb-3 mb-lg-4">
              Convene. Discuss. Build.
            </h1>
            <p className="events-hero-deck mb-0">
              Summits, workshops, and live conversations that connect policymakers, educators, and industry leaders.
            </p>
          </div>
        </section>
        <div className="events-filter-bar">
          <div className="container">
            <nav className="d-flex flex-wrap align-items-center gap-2 py-3" aria-label="Event categories">
              <Link className="events-filter-pill is-active" href="/events" aria-current="page">
                Featured events
              </Link>
              <Link className="events-filter-pill" href="/events/speakers">
                Speakers
              </Link>
              <Link className="events-filter-pill" href="/events/sponsors">
                Sponsors
              </Link>
            </nav>
          </div>
        </div>
        <div className="container py-4 py-lg-5">
          {!events.length ? (
            <ComingSoonBlock
              title="Events coming soon"
              message="Add featured events in the admin panel — they will appear here automatically."
            />
          ) : (
            <div className="row row-cols-1 row-cols-md-2 g-4">
              {events.map((event) => (
                <div key={event.title} className="col">
                  <article className="event-card h-100 bg-white rounded-3 shadow-sm overflow-hidden d-flex flex-column">
                    <div className="event-card-media ratio ratio-16x10 position-relative">
                      <Image src={event.image} alt={event.title} fill className="object-fit-cover" sizes="50vw" />
                      <span className="event-card-tag">{event.tag}</span>
                    </div>
                    <div className="event-card-body d-flex flex-column flex-grow-1 p-3 p-md-4">
                      <h2 className="event-card-title serif-headline h5 mb-2">
                        <a href="#" className="event-card-title-link text-decoration-none">
                          {event.title}
                        </a>
                      </h2>
                      <p className="event-card-desc small text-secondary mb-3">{event.excerpt}</p>
                      <div className="event-card-meta small mt-auto">
                        <div className="event-meta-row">
                          <span>{event.date}</span>
                        </div>
                        <div className="event-meta-row">
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
