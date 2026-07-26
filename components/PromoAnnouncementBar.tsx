export default function PromoAnnouncementBar() {
  const northEventUrl = "https://www.educationtoday.co/events/north-india-educators-summit-2026";

  return (
    <section className="promo-announcement-bar" aria-label="Announcement">
      <div className="container-fluid px-3 px-lg-4">
        <div className="promo-announcement-inner d-flex flex-wrap align-items-center justify-content-between gap-2 py-2">
          <div className="promo-announcement-copy d-flex align-items-center gap-2 gap-md-3 min-w-0">
            <span className="promo-announcement-icon flex-shrink-0" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M13 2.5a1.5 1.5 0 0 1 3 0v11a1.5 1.5 0 0 1-3 0zm-10 0a1.5 1.5 0 0 1 3 0v11a1.5 1.5 0 0 1-3 0zm4-1.5a1.5 1.5 0 0 1 3 0v14a1.5 1.5 0 0 1-3 0z" />
              </svg>
            </span>
            <span className="promo-announcement-badge">UPCOMING</span>
            <p className="promo-announcement-text mb-0">
              North Educators Summit &amp; Awards 2026 — upcoming in Gurugram, Sept 10. Get your ticket now.
            </p>
          </div>
          <a
            href={northEventUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="promo-announcement-cta flex-shrink-0"
          >
            GET TICKETS <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
