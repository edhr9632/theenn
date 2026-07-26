import Link from "next/link";
import Image from "next/image";
import TopDate from "./TopDate";
import PromoAnnouncementBar from "./PromoAnnouncementBar";
import SpotifyHeaderAd from "./SpotifyHeaderAd";
import SurveyFormModal from "./SurveyFormModal";
import SiteSearchButton from "./SiteSearchButton";
import { getSurveyConfig, hasSurveyTarget } from "@/lib/survey";

type SiteMastheadProps = {
  activeNav?: "home" | "news" | "podcasts" | "events" | "about" | "contact" | "panel" | "insights";
  newsActive?: "daily" | "weekly" | "trending" | "press";
  podcastActive?: "knowledge-plus" | "enn-daily-brief" | "classroom-voices";
};

const breakingItems = [
  "National Education Policy 2026 rollout calendar released",
  "Universities post record endowment inflows this quarter",
  "42 countries adopt mandatory clinical training programs for educators",
  "State boards announce new digital literacy standards for grades 6–12",
];

const podcastLinks = [
  { href: "/podcasts/knowledge-plus", label: "Knowledge Plus", key: "knowledge-plus" },
  { href: "/podcasts/enn-daily-brief", label: "ENN Daily Brief", key: "enn-daily-brief" },
  { href: "/podcasts/classroom-voices", label: "Classroom Voices", key: "classroom-voices" },
] as const;

export default function SiteMasthead({ activeNav, newsActive, podcastActive }: SiteMastheadProps) {
  const surveyConfig = getSurveyConfig();
  const hasSurvey = hasSurveyTarget(surveyConfig);

  return (
    <div className="site-masthead">
      <SpotifyHeaderAd />
      <PromoAnnouncementBar />

      <div className="site-masthead-sticky sticky-top">
        <div className="top-bar text-white py-2">
          <div className="container-fluid px-3 px-lg-4">
            <div className="d-flex flex-column flex-md-row align-items-center justify-content-md-between gap-2 gap-md-3">
              <span className="top-bar-live small fw-semibold text-uppercase d-inline-flex align-items-center gap-2">
                <span className="top-bar-live-dot" aria-hidden="true" />
                <span className="top-bar-live-label">Live</span> <span className="text-white-50">•</span> <TopDate />
              </span>
              <div className="top-bar-links small text-center text-md-end flex-shrink-0">
                <Link href="/insights" className="link-light link-underline-opacity-0 link-underline-opacity-100-hover">
                  Insights
                </Link>
                <span className="text-white-50 mx-2">|</span>
                <Link href="/newsletter" className="link-light link-underline-opacity-0 link-underline-opacity-100-hover">
                  Newsletter
                </Link>
                <span className="text-white-50 mx-2">|</span>
                <SiteSearchButton asTopBarLink />
                {hasSurvey ? (
                  <>
                    <span className="text-white-50 mx-2">|</span>
                    <SurveyFormModal
                      embedUrl={surveyConfig.embedUrl}
                      directUrl={surveyConfig.directUrl}
                      label="Survey"
                    />
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <header className="main-header border-bottom bg-white">
          <nav className="navbar navbar-expand-lg navbar-light py-2 py-lg-3">
            <div className="container">
              <Link className="navbar-brand site-brand-lockup py-0 me-lg-4" href="/" aria-label="Education News Network home">
                <Image
                  className="site-logo site-logo--header"
                  src="/images/Enn_logo1.png"
                  alt="Education News Network"
                  width={320}
                  height={90}
                  priority
                />
              </Link>
              <button
                className="navbar-toggler border-0 shadow-none"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#mainNav"
                aria-controls="mainNav"
                aria-expanded="false"
                aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon" />
              </button>
              <div className="collapse navbar-collapse" id="mainNav">
                <ul className="navbar-nav mx-lg-auto mb-2 mb-lg-0 gap-lg-1 text-center text-lg-start">
                  <li className="nav-item">
                    <Link className={`nav-link px-3 fw-medium${activeNav === "home" ? " active" : ""}`} href="/" aria-current={activeNav === "home" ? "page" : undefined}>
                      Home
                    </Link>
                  </li>
                  <li className="nav-item dropdown">
                    <button
                      type="button"
                      className={`nav-link dropdown-toggle px-3 fw-medium bg-transparent border-0${activeNav === "news" ? " active" : ""}`}
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      News Blogs
                    </button>
                    <ul className="dropdown-menu border-0 shadow">
                      <li><Link className={`dropdown-item${newsActive === "daily" ? " active" : ""}`} href="/news">Daily News</Link></li>
                      <li><Link className={`dropdown-item${newsActive === "weekly" ? " active" : ""}`} href="/weekly-news">Weekly News</Link></li>
                      <li><Link className={`dropdown-item${newsActive === "trending" ? " active" : ""}`} href="/trending-news">Trending News</Link></li>
                      <li><Link className={`dropdown-item${newsActive === "press" ? " active" : ""}`} href="/press-release">Press Release</Link></li>
                    </ul>
                  </li>
                  <li className="nav-item dropdown">
                    <button
                      type="button"
                      className={`nav-link dropdown-toggle px-3 fw-medium bg-transparent border-0${activeNav === "podcasts" ? " active" : ""}`}
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      Podcasts
                    </button>
                    <ul className="dropdown-menu border-0 shadow">
                      {podcastLinks.map((item) => (
                        <li key={item.key}>
                          <Link className={`dropdown-item${podcastActive === item.key ? " active" : ""}`} href={item.href}>
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                  <li className="nav-item">
                    <Link className={`nav-link px-3 fw-medium${activeNav === "panel" ? " active" : ""}`} href="/panel-discussions">
                      Panel Discussion
                    </Link>
                  </li>
                  <li className="nav-item dropdown">
                    <button
                      type="button"
                      className={`nav-link dropdown-toggle px-3 fw-medium bg-transparent border-0${activeNav === "events" ? " active" : ""}`}
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      Events
                    </button>
                    <ul className="dropdown-menu border-0 shadow">
                      <li><Link className="dropdown-item" href="/events">Featured events</Link></li>
                      <li><Link className="dropdown-item" href="/events/speakers">Speakers</Link></li>
                      <li><Link className="dropdown-item" href="/events/sponsors">Sponsors</Link></li>
                    </ul>
                  </li>
                  <li className="nav-item">
                    <Link className={`nav-link px-3 fw-medium${activeNav === "insights" ? " active" : ""}`} href="/insights">
                      Insights
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className={`nav-link px-3 fw-medium${activeNav === "about" ? " active" : ""}`} href="/about">
                      About
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className={`nav-link px-3 fw-medium${activeNav === "contact" ? " active" : ""}`} href="/contact">
                      Contact Us
                    </Link>
                  </li>
                </ul>
                <div className="d-flex align-items-center justify-content-center ms-lg-3 mt-3 mt-lg-0 pt-3 pt-lg-0 border-top border-lg-0">
                  <SiteSearchButton />
                </div>
              </div>
            </div>
          </nav>
        </header>

        <div className="breaking-bar text-white py-2 overflow-hidden">
          <p className="visually-hidden">Breaking news ticker</p>
          <div className="container-fluid px-0">
            <div className="d-flex align-items-center">
              <span className="breaking-label flex-shrink-0 px-3 py-1 ms-0 fw-bold small text-uppercase">● Breaking</span>
              <div className="ticker-wrap flex-grow-1">
                <div className="ticker-track small" aria-hidden="true">
                  {[0, 1].map((i) => (
                    <span key={i} className="ticker-segment">
                      {breakingItems.map((item) => (
                        <span key={`${i}-${item}`}>
                          <span className="ticker-item">{item}</span>
                          <span className="ticker-dot">•</span>
                        </span>
                      ))}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
