"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SiteMasthead from "@/components/SiteMasthead";
import ComingSoonBlock from "@/components/ComingSoonBlock";
import PressBitThumb from "@/components/PressBitThumb";
import type { PressBit } from "@/lib/pressBitTypes";

type PressBitsResponse = {
  items?: PressBit[];
  years?: number[];
  categoriesByYear?: Record<number, string[]>;
};

export default function PressBitsPage() {
  const [items, setItems] = useState<PressBit[]>([]);
  const [yearsFromApi, setYearsFromApi] = useState<number[]>([]);
  const [categoriesByYear, setCategoriesByYear] = useState<Record<number, string[]>>({});
  const [yearFilter, setYearFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams();
    if (yearFilter !== "All") params.set("year", yearFilter);
    if (categoryFilter !== "All") params.set("category", categoryFilter);

    void fetch(`/api/press-bits?${params.toString()}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data: PressBitsResponse | null) => {
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
              Short Leader Bytes and reel highlights from ENN summits, awards, and leadership events.
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
              <Link className="events-filter-pill is-active" href="/events/leader-bytes" aria-current="page">
                Leader Bytes
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
                aria-label="Filter Leader Bytes by year"
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
                aria-label="Filter Leader Bytes by category"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h2 className="events-grid-section-title serif-headline mb-3 mb-lg-4">Leader Bytes</h2>

          {loading ? (
            <p className="text-secondary mb-0">Loading Leader Bytes…</p>
          ) : items.length === 0 ? (
            <ComingSoonBlock
              title="Leader Bytes coming soon"
              message="Add Leader Byte reels in Admin → Events → Leader Bytes — they will appear here automatically."
            />
          ) : (
            <div className="row row-cols-2 row-cols-md-3 row-cols-xl-4 g-3 g-lg-4">
              {items.map((item) => (
                <div key={item.id} className="col">
                  <Link
                    href={`/events/leader-bytes/${item.slug}`}
                    className="events-press-bit-card h-100 d-flex flex-column text-decoration-none"
                  >
                    <div className="events-press-bit-thumb position-relative overflow-hidden rounded-3">
                      <PressBitThumb item={item} />
                    </div>
                    <div className="pt-3 d-flex flex-column flex-grow-1">
                      <h3 className="events-press-bit-title mb-1">{item.title}</h3>
                      <p className="events-press-bit-meta small mb-0">
                        {item.year} · {item.category}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
