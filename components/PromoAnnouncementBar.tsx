"use client";

import { useEffect, useState } from "react";

const UPCOMING_EVENTS = [
  {
    text: "North Educators' Summit & Awards 2026: Gurugram — 10th September 2026. Get your ticket now.",
    href: "https://www.educationtoday.co/events/north-india-educators-summit-2026",
  },
  {
    text: "Maharashtra Educators' Summit & Awards 2026: Mumbai — 29th September 2026. Get your ticket now.",
    href: "https://www.educationtoday.co/events/maharashtra-educators-summit-2026",
  },
  {
    text: "South India Educators' Summit 2026: Hyderabad — 7th October 2026. Get your ticket now.",
    href: "https://www.educationtoday.co/events/south-india-educators-summit-hyderabad/2026",
  },
  {
    text: "14th National Conference on K-12 Leadership 2026: Bengaluru — 3rd December 2026. Get your ticket now.",
    href: "https://educationtoday.co/events/13th-national-conference-bangalore",
  },
] as const;

export default function PromoAnnouncementBar() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const event = UPCOMING_EVENTS[index];

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % UPCOMING_EVENTS.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <section
      className="promo-announcement-bar"
      aria-label="Upcoming events"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="container-fluid px-3 px-lg-4">
        <div className="promo-announcement-inner d-flex flex-wrap align-items-center justify-content-between gap-2 py-2">
          <div className="promo-announcement-copy d-flex align-items-center gap-2 gap-md-3 min-w-0">
            <span className="promo-announcement-icon flex-shrink-0" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M13 2.5a1.5 1.5 0 0 1 3 0v11a1.5 1.5 0 0 1-3 0zm-10 0a1.5 1.5 0 0 1 3 0v11a1.5 1.5 0 0 1-3 0zm4-1.5a1.5 1.5 0 0 1 3 0v14a1.5 1.5 0 0 1-3 0z" />
              </svg>
            </span>
            <span className="promo-announcement-badge">UPCOMING</span>
            <div className="promo-announcement-slide" aria-live="polite">
              <p key={event.href} className="promo-announcement-text mb-0">
                {event.text}
              </p>
            </div>
          </div>
          <a
            href={event.href}
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
