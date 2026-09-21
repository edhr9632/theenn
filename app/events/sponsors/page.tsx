"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import SiteMasthead from "@/components/SiteMasthead";
import ComingSoonBlock from "@/components/ComingSoonBlock";
import type { SponsorRecord } from "@/lib/eventPeopleTypes";
import { extractYoutubeId } from "@/lib/videoEmbed";

type SponsorsResponse = {
  items?: SponsorRecord[];
  years?: number[];
  categoriesByYear?: Record<number, string[]>;
};

export default function SponsorsPage() {
  const [items, setItems] = useState<SponsorRecord[]>([]);
  const [yearsFromApi, setYearsFromApi] = useState<number[]>([]);
  const [categoriesByYear, setCategoriesByYear] = useState<Record<number, string[]>>({});
  const [yearFilter, setYearFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState<SponsorRecord | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams();
    if (yearFilter !== "All") params.set("year", yearFilter);
    if (categoryFilter !== "All") params.set("category", categoryFilter);

    void fetch(`/api/sponsors?${params.toString()}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data: SponsorsResponse | null) => {
        if (cancelled || !data) return;
        setItems(data.items ?? []);
        setYearsFromApi(data.years ?? []);
        setCategoriesByYear(data.categoriesByYear ?? {});
      })
      .catch(() => {
        if (!cancelled) {
          setItems([]);
          setYearsFromApi([]);
          setCategoriesByYear({});
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [yearFilter, categoryFilter]);

  useEffect(() => {
    if (!activeItem) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveItem(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeItem]);

  const years = useMemo(() => ["All", ...yearsFromApi.map(String)], [yearsFromApi]);

  const categories = useMemo(() => {
    if (yearFilter === "All") {
      const all = Array.from(new Set(Object.values(categoriesByYear).flatMap((list) => list))).sort((a, b) =>
        a.localeCompare(b),
      );
      return ["All", ...all];
    }
    return ["All", ...(categoriesByYear[Number(yearFilter)] ?? [])];
  }, [yearFilter, categoriesByYear]);

  useEffect(() => {
    if (categoryFilter !== "All" && !categories.includes(categoryFilter)) {
      setCategoryFilter("All");
    }
  }, [categories, categoryFilter]);

  const youtubeId = activeItem ? extractYoutubeId(activeItem.videoUrl) : null;

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
              Partners who help power ENN summits, awards, and leadership conferences.
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
              <Link className="events-filter-pill is-active" href="/events/sponsors" aria-current="page">
                Sponsors
              </Link>
              <Link className="events-filter-pill" href="/events/press-bits">
                Press Bits
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

          {loading ? (
            <p className="text-secondary mb-0">Loading sponsors…</p>
          ) : items.length === 0 ? (
            <ComingSoonBlock
              title="Sponsors coming soon"
              message="Add sponsors in Admin → Events → Sponsors — they will appear here automatically."
            />
          ) : (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-4">
              {items.map((sponsor) => (
                <div key={sponsor.id} className="col">
                  <button
                    type="button"
                    className="events-grid-card events-speaker-card h-100 bg-white rounded-3 shadow-sm overflow-hidden d-flex flex-column text-center text-xl-start text-decoration-none border-0 p-0 w-100"
                    onClick={() => setActiveItem(sponsor)}
                  >
                    <div className="ratio ratio-1x1 position-relative">
                      {sponsor.image ? (
                        sponsor.image.startsWith("data:") || sponsor.image.startsWith("/") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={sponsor.image}
                            alt={sponsor.name}
                            className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
                          />
                        ) : (
                          <Image
                            src={sponsor.image}
                            alt={sponsor.name}
                            fill
                            className="object-fit-cover"
                            sizes="(max-width:768px) 50vw, 25vw"
                          />
                        )
                      ) : (
                        <span className="position-absolute top-0 start-0 w-100 h-100 bg-light" />
                      )}
                      <span className="events-press-bit-play" aria-hidden="true">
                        ▶
                      </span>
                    </div>
                    <div className="p-3 p-md-4 d-flex flex-column flex-grow-1">
                      <h3 className="events-speaker-name serif-headline h6 mb-1">{sponsor.name}</h3>
                      {sponsor.tier ? <p className="events-speaker-role text-secondary mb-2">{sponsor.tier}</p> : null}
                      <p className="events-speaker-meta small mb-0">
                        {sponsor.year} · {sponsor.category}
                      </p>
                      <span className="events-video-link mt-3">
                        {sponsor.sourceType === "upload" ? "Watch video →" : "Watch on YouTube →"}
                      </span>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {activeItem ? (
        <div
          className="events-press-bit-modal"
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.name}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActiveItem(null);
          }}
        >
          <div className="events-press-bit-modal-panel">
            <div className="events-press-bit-modal-head">
              <p className="events-press-bit-modal-title mb-0">{activeItem.name}</p>
              <button
                type="button"
                className="events-press-bit-modal-close"
                aria-label="Cancel and close video"
                onClick={() => setActiveItem(null)}
              >
                ✕ Cancel
              </button>
            </div>
            <div className="events-press-bit-modal-body">
              {youtubeId ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                  title={activeItem.name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <video src={activeItem.videoUrl} controls autoPlay playsInline />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
