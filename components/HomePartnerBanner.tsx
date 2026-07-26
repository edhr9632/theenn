import type { PromoBanner } from "@/lib/homeTypes";
import ComingSoonBlock from "./ComingSoonBlock";

type HomePartnerBannerProps = {
  banner: PromoBanner | null;
};

export default function HomePartnerBanner({ banner }: HomePartnerBannerProps) {
  if (!banner) {
    return (
      <section className="partner-pro-banner mt-2 mt-lg-3" aria-label="Partner advertisement">
        <div className="container">
          <ComingSoonBlock
            compact
            title="Partner spotlight coming soon"
            message="Partner promotions will appear here once added in the admin panel."
          />
        </div>
      </section>
    );
  }

  return (
    <section className="partner-pro-banner mt-2 mt-lg-3" aria-labelledby="partner-pro-heading">
      <div className="container">
        <div className="partner-pro-inner d-flex flex-column flex-md-row align-items-stretch align-items-md-center justify-content-md-between gap-3 gap-md-4">
          <div className="d-flex gap-3 gap-md-4 align-items-start flex-grow-1 min-w-0">
            <div className="partner-pro-icon flex-shrink-0" aria-hidden="true">
              ✦
            </div>
            <div className="min-w-0">
              {banner.eyebrow ? (
                <p className="partner-pro-label text-uppercase small fw-semibold mb-2">{banner.eyebrow}</p>
              ) : null}
              <h2 id="partner-pro-heading" className="partner-pro-title serif-headline mb-2">
                {banner.title}
              </h2>
              {banner.subtitle ? <p className="partner-pro-sub small mb-0">{banner.subtitle}</p> : null}
            </div>
          </div>
          <a
            href={banner.ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="partner-pro-cta align-self-center flex-shrink-0"
          >
            {banner.ctaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
