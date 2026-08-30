import Link from "next/link";
import Image from "next/image";
import {
  footerCompanyLinks,
  footerExploreLinks,
  footerServiceGroups,
  footerSocialLinks,
} from "@/lib/footerServices";
import { footerSeoGroups } from "@/lib/footerSeo";
import NewsletterForm from "@/components/NewsletterForm";
import FooterLatestStories from "@/components/FooterLatestStories";

export default function SiteFooter() {
  return (
    <footer className="site-footer text-white mt-auto">
      <div className="footer-main">
        <div className="container py-5 py-lg-5">
          <div className="row g-4 g-lg-5 align-items-start">
            <div className="col-lg-4 col-md-6">
              <div className="footer-brand">
                <Link href="/" className="footer-logo-box" aria-label="Education News Network home">
                  <Image
                    className="site-logo site-logo--footer"
                    src="/images/Enn_logo1.png"
                    alt="Education News Network"
                    width={352}
                    height={100}
                  />
                </Link>
              </div>
              <p className="footer-about-text mt-3 mb-4">
                Independent journalism for a connected world. Daily reporting, deep analysis, and the conversations that
                shape what comes next in education.
              </p>
              <div className="footer-social" aria-label="Follow ENN">
                {footerSocialLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="footer-social-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="col-lg-2 col-md-3 col-6">
              <h2 className="footer-col-title">Explore</h2>
              <ul className="list-unstyled footer-link-list mb-0">
                {footerExploreLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-lg-2 col-md-3 col-6">
              <h2 className="footer-col-title">Company</h2>
              <ul className="list-unstyled footer-link-list mb-0">
                {footerCompanyLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-lg-4 col-md-12">
              <div className="footer-newsletter-card">
                <h2 className="footer-col-title">Newsletter</h2>
                <p className="footer-about-text mt-3 mb-3">
                  The day&apos;s most important education stories, delivered every morning.
                </p>
                <NewsletterForm source="footer" variant="footer" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="footer-services" aria-labelledby="footer-services-heading">
        <div className="container py-4 py-lg-5">
          <div className="footer-services-head">
            <h2 id="footer-services-heading" className="footer-services-title mb-0">
              ENN services
            </h2>
            <p className="footer-services-subtitle mb-0">Education news &amp; resources</p>
            <p className="footer-services-lead mb-0">
              Browse topics, policies, and the latest coverage from Education News Network — helpful for readers and
              search engines.
            </p>
          </div>
          <div className="row g-4 g-lg-5 mt-1">
            {footerServiceGroups.map((group) => (
              <div key={group.title} className="col-lg-6">
                <h3 className="footer-services-col-title mb-3">{group.title}</h3>
                <ul className="footer-services-tags list-unstyled d-flex flex-wrap gap-2 mb-0">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="footer-services-tag">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {footerSeoGroups.map((group) => (
              <div key={group.title} className="col-md-6 col-lg-4">
                <h3 className="footer-services-col-title mb-3">{group.title}</h3>
                <ul className="footer-services-tags list-unstyled d-flex flex-wrap gap-2 mb-0">
                  {group.links.map((link) => (
                    <li key={`${group.title}-${link.href}-${link.label}`}>
                      {link.href.startsWith("/") ? (
                        <Link href={link.href} className="footer-services-tag">
                          {link.label}
                        </Link>
                      ) : (
                        <a href={link.href} className="footer-services-tag">
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <FooterLatestStories />
          </div>
        </div>
      </section>

      <div className="footer-bottom">
        <div className="container py-3">
          <div className="footer-bottom-inner">
            <span className="footer-bottom-copy">© 2026 Education News Network. All rights reserved.</span>
            <div className="footer-bottom-links">
              <Link href="/privacy" className="footer-bottom-link">
                Privacy
              </Link>
              <Link href="/terms" className="footer-bottom-link">
                Terms
              </Link>
              <Link href="/ethics" className="footer-bottom-link">
                Ethics
              </Link>
              <Link href="/sitemap.xml" className="footer-bottom-link">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
