"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import SiteMasthead from "@/components/SiteMasthead";
import ComingSoonBlock from "@/components/ComingSoonBlock";
import type { SpeakerRecord } from "@/lib/eventPeopleTypes";
import { extractYoutubeId } from "@/lib/videoEmbed";

type SpeakersResponse = {
  items?: SpeakerRecord[];
  years?: number[];
  categoriesByYear?: Record<number, string[]>;
};

export default function SpeakersPage() {
  const [items, setItems] = useState<SpeakerRecord[]>([]);
  const [yearsFromApi, setYearsFromApi] = useState<number[]>([]);
  const [categoriesByYear, setCategoriesByYear] = useState<Record<number, string[]>>({});
  const [yearFilter, setYearFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState<SpeakerRecord | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams();
    if (yearFilter !== "All") params.set("year", yearFilter);
    if (categoryFilter !== "All") params.set("category", categoryFilter);

    void fetch(`/api/speakers?${params.toString()}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data: SpeakersResponse | null) => {
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
            <p className="events-hero-deck mb-0">Meet the voices shaping our live programs and panel conversations.</p>
          </div>
        </section>

        <div className="events-filter-bar">
          <div className="container">
            <nav className="d-flex flex-wrap align-items-center gap-2 py-3" aria-label="Event categories">
              <Link className="events-filter-pill" href="/events">
                Featured events
              </Link>
              <Link className="events-filter-pill is-active" href="/events/speakers" aria-current="page">
                Speakers
              </Link>
              <Link className="events-filter-pill" href="/events/sponsors">
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
                aria-label="Filter speakers by year"
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
                aria-label="Filter speakers by category"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h2 className="events-grid-section-title serif-headline mb-3 mb-lg-4">Featured speakers</h2>

          {loading ? (
            <p className="text-secondary mb-0">Loading speakers…</p>
          ) : items.length === 0 ? (
            <ComingSoonBlock
              title="Speakers coming soon"
              message="Add speakers in Admin → Events → Speakers — they will appear here automatically."
            />
          ) : (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-4">
              {items.map((speaker) => (
                <div key={speaker.id} className="col">
                  <button
                    type="button"
                    className="events-grid-card events-speaker-card h-100 bg-white rounded-3 shadow-sm overflow-hidden d-flex flex-column text-center text-xl-start text-decoration-none border-0 p-0 w-100"
                    onClick={() => setActiveItem(speaker)}
                  >
                    <div className="ratio ratio-1x1 position-relative">
                      {speaker.image ? (
                        speaker.image.startsWith("data:") || speaker.image.startsWith("/") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={speaker.image}
                            alt={speaker.name}
                            className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
                          />
                        ) : (
                          <Image
                            src={speaker.image}
                            alt={speaker.name}
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
                      <h3 className="events-speaker-name serif-headline h6 mb-1">{speaker.name}</h3>
                      {speaker.role ? <p className="events-speaker-role text-secondary mb-2">{speaker.role}</p> : null}
                      <p className="events-speaker-meta small mb-0">
                        {speaker.year} · {speaker.category}
                      </p>
                      <span className="events-video-link mt-3">
                        {speaker.sourceType === "upload" ? "Watch video →" : "Watch on YouTube →"}
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
                aria-label="Close video"
                onClick={() => setActiveItem(null)}
              >
                ✕
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
