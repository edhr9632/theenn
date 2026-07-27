"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import SiteMasthead from "@/components/SiteMasthead";
import ComingSoonBlock from "@/components/ComingSoonBlock";
import { eventEditions, getCategoriesForYear, getEventYears, sponsors } from "@/lib/data";

export default function SponsorsPage() {
  const years = useMemo(() => ["All", ...getEventYears().map(String)], []);
  const [yearFilter, setYearFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const categories = useMemo(() => ["All", ...getCategoriesForYear(yearFilter)], [yearFilter]);

  useEffect(() => {
    if (categoryFilter !== "All" && !categories.includes(categoryFilter)) {
      setCategoryFilter("All");
    }
  }, [categories, categoryFilter]);

  const filteredSponsors = useMemo(
    () =>
      sponsors.filter((sponsor) => {
        const yearMatch = yearFilter === "All" || String(sponsor.year) === yearFilter;
        const categoryMatch = categoryFilter === "All" || sponsor.category === categoryFilter;
        return yearMatch && categoryMatch;
      }),
    [yearFilter, categoryFilter],
  );

  const eventTitleById = useMemo(
    () => new Map(eventEditions.map((event) => [event.id, event.title])),
    [],
  );

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
            <p className="events-hero-deck mb-0">Partners who help power ENN summits, awards, and leadership conferences.</p>
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
              <Link className="events-filter-pill is-active" href="/events/sponsors" aria-current="page">
                Sponsors
              </Link>
            </nav>
          </div>
        </div>
        <div className="container py-4 py-lg-5">
          <div className="events-subfilters mb-4">
            <div className="events-subfilter-group">
              <p className="events-subfilter-label mb-2">Year</p>
              <select
                className="events-subfilter-select form-select"
                value={yearFilter}
                onChange={(e) => {
                  setYearFilter(e.target.value);
                  setCategoryFilter("All");
                }}
                aria-label="Filter sponsors by year"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="events-subfilter-group">
              <p className="events-subfilter-label mb-2">Category</p>
              <select
                className="events-subfilter-select form-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filter sponsors by category"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h2 className="events-grid-section-title serif-headline mb-3 mb-lg-4">Featured sponsors</h2>
          {filteredSponsors.length === 0 ? (
            <ComingSoonBlock
              title="Sponsors coming soon"
              message="Add sponsors in the admin panel — they will appear here automatically."
            />
          ) : (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-4">
              {filteredSponsors.map((sponsor) => (
                <div key={`${sponsor.name}-${sponsor.year}-${sponsor.category}`} className="col">
                  <a
                    href={sponsor.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="events-grid-card events-speaker-card h-100 bg-white rounded-3 shadow-sm overflow-hidden d-flex flex-column text-center text-xl-start text-decoration-none"
                  >
                    <div className="ratio ratio-1x1 position-relative">
                      <Image src={sponsor.image} alt={sponsor.name} fill className="object-fit-cover" sizes="25vw" />
                    </div>
                    <div className="p-3 p-md-4 d-flex flex-column flex-grow-1">
                      <h3 className="events-speaker-name serif-headline h6 mb-1">{sponsor.name}</h3>
                      <p className="events-speaker-role text-secondary mb-2">{sponsor.tier}</p>
                      <p className="events-speaker-meta small mb-2">
                        {sponsor.year} · {sponsor.category}
                      </p>
                      <p className="events-speaker-event small text-muted mb-0">{eventTitleById.get(sponsor.eventId)}</p>
                      <span className="events-video-link mt-3">Watch on YouTube →</span>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
