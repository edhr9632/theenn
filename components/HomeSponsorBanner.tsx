import type { PromoBanner } from "@/lib/homeTypes";
import ComingSoonBlock from "./ComingSoonBlock";

type HomeSponsorBannerProps = {
  banner: PromoBanner | null;
};

export default function HomeSponsorBanner({ banner }: HomeSponsorBannerProps) {
  if (!banner) {
    return (
      <section className="sponsor-banner-full mt-4 mt-lg-5" aria-label="TV Schedule">
        <div className="container">
          <ComingSoonBlock
            compact
            title="TV Schedule coming soon"
            message="Add the Knowledge Plus banner in the admin panel when ready."
            className="sponsor-coming-soon"
            ctaLabel="Subscribe"
            ctaHref="https://www.educationtoday.co/magazines/upcoming-magazines/subscribe"
          />
        </div>
      </section>
    );
  }

  return (
    <section className="sponsor-banner-full mt-4 mt-lg-5" aria-labelledby="sponsor-heading">
      <div className="container">
        <div className="sponsor-banner-inner d-flex flex-column flex-md-row align-items-stretch align-items-md-center justify-content-md-between gap-3 gap-md-4">
          <div className="d-flex gap-2 gap-md-3 align-items-start flex-grow-1 min-w-0">
            <div className="sponsor-star-badge flex-shrink-0" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M2.866 14.85c-.078.444.36.791.746.593L8 13.187l4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.478 3.352-.83 4.73z" />
              </svg>
            </div>
            <div className="min-w-0 sponsor-banner-copy">
              {banner.eyebrow ? (
                <p className="sponsor-eyebrow text-white text-uppercase mb-1">{banner.eyebrow}</p>
              ) : null}
              <h2 id="sponsor-heading" className="sponsor-headline text-white mb-1">
                {banner.title}
              </h2>
              {banner.subtitle ? <p className="sponsor-host text-white mb-0">{banner.subtitle}</p> : null}
            </div>
          </div>
          <a href={banner.ctaUrl} className="sponsor-cta align-self-center flex-shrink-0 ms-md-3">
            {banner.ctaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
