import type { PromoBanner } from "@/lib/homeTypes";

type HomePartnerBannerProps = {
  banner: PromoBanner | null;
};

const DEFAULT_PARTNER_BANNER: PromoBanner = {
  id: "partner_msa",
  enabled: true,
  eyebrow: "Partner - Advertisement",
  title: "Looking for school admission? Visit MSA",
  subtitle: "My School Admission helps parents discover schools, compare options, and apply with ease.",
  ctaLabel: "Visit MSA",
  ctaUrl: "https://myschooladmission.com/",
  variant: "partner",
};

export default function HomePartnerBanner({ banner }: HomePartnerBannerProps) {
  const resolved = banner ?? DEFAULT_PARTNER_BANNER;

  return (
    <section className="partner-pro-banner mt-2 mt-lg-3" aria-labelledby="partner-pro-heading">
      <div className="container">
        <div className="partner-pro-inner d-flex flex-column flex-md-row align-items-stretch align-items-md-center justify-content-md-between gap-3 gap-md-4">
          <div className="d-flex gap-3 gap-md-4 align-items-start flex-grow-1 min-w-0">
            <div className="partner-pro-icon flex-shrink-0" aria-hidden="true">
              ✦
            </div>
            <div className="min-w-0">
              {resolved.eyebrow ? (
                <p className="partner-pro-label text-uppercase small fw-semibold mb-2">{resolved.eyebrow}</p>
              ) : null}
              <h2 id="partner-pro-heading" className="partner-pro-title serif-headline mb-2">
                {resolved.title}
              </h2>
              {resolved.subtitle ? <p className="partner-pro-sub small mb-0">{resolved.subtitle}</p> : null}
            </div>
          </div>
          <a
            href={resolved.ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="partner-pro-cta align-self-center flex-shrink-0"
          >
            {resolved.ctaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
