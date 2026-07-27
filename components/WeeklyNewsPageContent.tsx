"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SiteMasthead from "@/components/SiteMasthead";
import ComingSoonBlock from "@/components/ComingSoonBlock";
import {
  DEFAULT_WEEKLY_CITIES,
  readWeeklyCities,
  readWeeklyIssues,
  type AdminWeeklyIssue,
  type WeeklyCity,
} from "@/lib/weeklyAdmin";
import { downloadWeeklyPdf, getWeeklyDownloadName, getWeeklyViewerPath } from "@/lib/weeklyIssueUtils";

const filters = [
  { href: "/news", label: "Daily", key: "daily" },
  { href: "/weekly-news", label: "Weekly", key: "weekly" },
  { href: "/trending-news", label: "Trending", key: "trending" },
  { href: "/press-release", label: "Press release", key: "press" },
] as const;

function IssueActions({ issue, large = false }: { issue: AdminWeeklyIssue; large?: boolean }) {
  const viewerPath = getWeeklyViewerPath(issue.slug);
  const downloadName = getWeeklyDownloadName(issue);

  return (
    <div className={`weekly-issue-actions${large ? " weekly-issue-actions--lg" : ""}`}>
      <Link href={viewerPath} className="weekly-btn weekly-btn-primary">
        View PDF
      </Link>
      <button
        type="button"
        className="weekly-btn weekly-btn-ghost"
        onClick={() => downloadWeeklyPdf(issue.pdfUrl, downloadName)}
      >
        Download
      </button>
    </div>
  );
}

function IssueCard({ issue }: { issue: AdminWeeklyIssue }) {
  const viewerPath = getWeeklyViewerPath(issue.slug);

  return (
    <article className="weekly-issue-card">
      <Link
        href={viewerPath}
        className="weekly-issue-cover-link"
        aria-label={`Open ${issue.title} PDF for ${issue.dateLabel}`}
      >
        <div className="weekly-issue-cover">
          <Image
            src={issue.coverImage}
            alt={`Education Today ${issue.title} — ${issue.dateLabel}`}
            fill
            className="object-fit-cover weekly-cover-img"
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized={issue.coverImage.startsWith("data:")}
          />
          <span className="weekly-issue-cover-shade" aria-hidden="true" />
          <span className="weekly-issue-open-hint">View PDF →</span>
        </div>
      </Link>
      <div className="weekly-issue-body">
        <p className="weekly-issue-date mb-1">
          {issue.dateLabel} <span aria-hidden="true">/</span> {issue.weekday}
        </p>
        <h3 className="weekly-issue-title serif-headline mb-2">{issue.title}</h3>
        <p className="weekly-issue-tagline mb-3">{issue.tagline}</p>
        <ul className="weekly-issue-tags list-unstyled d-flex flex-wrap gap-1 mb-3">
          {issue.highlights.slice(0, 4).map((item) => (
            <li key={item.label}>
              <span className={`weekly-tag weekly-tag--${item.tone}`}>{item.label}</span>
            </li>
          ))}
        </ul>
        <IssueActions issue={issue} />
      </div>
    </article>
  );
}

export default function WeeklyNewsPageContent() {
  const [cities, setCities] = useState<WeeklyCity[]>(DEFAULT_WEEKLY_CITIES);
  const [issues, setIssues] = useState<AdminWeeklyIssue[]>([]);
  const [cityId, setCityId] = useState(DEFAULT_WEEKLY_CITIES[0]?.id ?? "");

  useEffect(() => {
    const loadedCities = readWeeklyCities();
    const loadedIssues = readWeeklyIssues();
    setCities(loadedCities);
    setIssues(loadedIssues);
    const withContent = loadedCities.find((city) => loadedIssues.some((issue) => issue.cityId === city.id));
    setCityId(withContent?.id ?? loadedCities[0]?.id ?? "");
  }, []);

  const selectedCity = useMemo(() => cities.find((city) => city.id === cityId) ?? cities[0], [cities, cityId]);

  const cityIssues = useMemo(() => {
    const filtered = issues.filter((issue) => issue.cityId === cityId);
    return filtered.length ? filtered : issues.filter((issue) => issue.cityName === selectedCity?.name);
  }, [issues, cityId, selectedCity]);

  const featured = cityIssues.find((item) => item.featured) ?? cityIssues[0];
  const rest = cityIssues.filter((item) => item.slug !== featured?.slug);

  return (
    <>
      <SiteMasthead activeNav="news" newsActive="weekly" />
      <main className="news-page weekly-news-page">
        <section className="news-hero" aria-labelledby="weekly-hero-heading">
          <div className="container">
            <p className="news-hero-eyebrow text-uppercase mb-2 mb-lg-3">Weekly News</p>
            <h1 id="weekly-hero-heading" className="news-hero-title serif-headline mb-3 mb-lg-4">
              Education Today Weekly
            </h1>
            <p className="news-hero-deck mb-0">
              City magazine editions — pick a city, open any cover as PDF, and download it.
            </p>
          </div>
        </section>

        <div className="news-filter-bar">
          <div className="container">
            <nav className="d-flex flex-wrap align-items-center gap-1 gap-md-2 py-1" aria-label="News categories">
              {filters.map((f) => (
                <Link
                  key={f.key}
                  className={`news-filter-pill${f.key === "weekly" ? " is-active" : ""}`}
                  href={f.href}
                  aria-current={f.key === "weekly" ? "page" : undefined}
                >
                  {f.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="weekly-city-bar">
          <div className="container py-3">
            <nav className="weekly-city-pills" aria-label="Weekly cities">
              {cities.map((city) => {
                const count = issues.filter((issue) => issue.cityId === city.id).length;
                return (
                  <button
                    key={city.id}
                    type="button"
                    className={`weekly-city-pill${cityId === city.id ? " is-active" : ""}`}
                    onClick={() => setCityId(city.id)}
                    aria-pressed={cityId === city.id}
                  >
                    {city.name}
                    {count > 0 ? <span className="weekly-city-count">{count}</span> : null}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {!featured ? (
          <div className="container py-5">
            <ComingSoonBlock
              title="Weekly news coming soon"
              message="Add city magazine editions in the admin Weekly News panel — they will appear here automatically."
            />
          </div>
        ) : (
          <>
            <section className="weekly-featured" aria-labelledby="weekly-featured-heading">
              <div className="container py-4 py-lg-5">
                <div className="weekly-featured-shell">
                  <div className="weekly-featured-meta">
                    <p className="weekly-mast-kicker text-uppercase mb-2">Education Today</p>
                    <p className="weekly-mast-ribbon mb-3">Weekly {selectedCity?.name} News</p>
                    <h2 id="weekly-featured-heading" className="weekly-featured-title serif-headline mb-2">
                      {featured.title}
                    </h2>
                    <p className="weekly-featured-date mb-3">
                      {featured.dateLabel} / {featured.weekday.toUpperCase()}
                    </p>
                    <p className="weekly-featured-tagline mb-3">{featured.tagline}</p>
                    <ul className="weekly-issue-tags list-unstyled d-flex flex-wrap gap-2 mb-4">
                      {featured.highlights.map((item) => (
                        <li key={item.label}>
                          <span className={`weekly-tag weekly-tag--${item.tone}`}>{item.label}</span>
                        </li>
                      ))}
                    </ul>
                    <IssueActions issue={featured} large />
                    <p className="weekly-featured-note mb-0 mt-3">
                      Click the cover or <strong>View PDF</strong> to open the full newspaper · use{" "}
                      <strong>Download</strong> to save the PDF.
                    </p>
                  </div>

                  <Link
                    href={getWeeklyViewerPath(featured.slug)}
                    className="weekly-featured-cover-link"
                    aria-label={`Open featured weekly PDF for ${featured.dateLabel}`}
                  >
                    <div className="weekly-featured-cover">
                      <Image
                        src={featured.coverImage}
                        alt={`Featured weekly cover ${featured.dateLabel}`}
                        fill
                        priority
                        className="object-fit-cover weekly-cover-img"
                        sizes="(max-width: 992px) 100vw, 48vw"
                        unoptimized={featured.coverImage.startsWith("data:")}
                      />
                      <span className="weekly-featured-cover-badge">Latest issue</span>
                    </div>
                  </Link>
                </div>
              </div>
            </section>

            <section className="weekly-archive" aria-labelledby="weekly-archive-heading">
              <div className="container pb-5">
                <div className="weekly-archive-head mb-4">
                  <h2 id="weekly-archive-heading" className="weekly-archive-title serif-headline mb-1">
                    Past weekly editions — {selectedCity?.name}
                  </h2>
                  <p className="weekly-archive-sub mb-0">Browse earlier weeklies and download any PDF.</p>
                </div>
                {rest.length === 0 ? (
                  <p className="text-secondary mb-0">No past editions for this city yet.</p>
                ) : (
                  <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
                    {rest.map((issue) => (
                      <div key={issue.slug} className="col">
                        <IssueCard issue={issue} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
}
