import Link from "next/link";
import Image from "next/image";
import { footerServiceGroups } from "@/lib/footerServices";
import NewsletterForm from "@/components/NewsletterForm";

export default function SiteFooter() {
  return (
    <footer className="site-footer text-white mt-auto">
      <div className="footer-main py-5">
        <div className="container">
          <div className="row g-4 g-lg-5">
            <div className="col-lg-5 col-md-6 col-12">
              <div className="footer-brand d-flex align-items-start">
                <Link href="/" className="footer-logo-box" aria-label="Education News Network home">
                  <Image className="site-logo site-logo--footer" src="/images/Enn_logo1.png" alt="Education News Network" width={352} height={100} />
                </Link>
              </div>
              <p className="footer-about-text mb-0">
                Independent journalism for a connected world. Daily reporting, deep analysis, and the conversations that shape what comes next.
              </p>
            </div>
            <div className="col-lg-2 col-md-6 col-6">
              <h2 className="footer-col-title">News</h2>
              <ul className="list-unstyled footer-link-list mb-0 mt-3">
                <li><Link href="/news" className="footer-link">Daily News</Link></li>
                <li><Link href="/press-release" className="footer-link">Press Release</Link></li>
              </ul>
            </div>
            <div className="col-lg-2 col-md-6 col-6">
              <h2 className="footer-col-title">Events</h2>
              <ul className="list-unstyled footer-link-list mb-0 mt-3">
                <li><Link href="/events" className="footer-link">Featured events</Link></li>
                <li><Link href="/events/speakers" className="footer-link">Speakers</Link></li>
                <li><Link href="/events/sponsors" className="footer-link">Sponsors</Link></li>
                <li><Link href="/about" className="footer-link">About Us</Link></li>
                <li><Link href="/contact" className="footer-link">Contact</Link></li>
              </ul>
            </div>
            <div className="col-lg-3 col-md-12">
              <h2 className="footer-col-title">Newsletter</h2>
              <p className="footer-about-text mt-3 mb-3">The day&apos;s most important stories, delivered every morning.</p>
              <NewsletterForm source="footer" variant="footer" />
              <p className="footer-about-text mt-3 mb-0 small">
                <Link href="/newsletter" className="footer-link">
                  Newsletter page
                </Link>
                {" · "}
                <Link href="/subscribe" className="footer-link">
                  Subscribe
                </Link>
                {" · "}
                <Link href="/signin" className="footer-link">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container py-3">
          <div className="d-flex flex-column flex-md-row justify-content-md-between align-items-center gap-2 small footer-bottom-inner">
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
            </div>
          </div>
        </div>
      </div>

      <section className="footer-services" aria-labelledby="footer-services-heading">
        <div className="container py-4 py-lg-5">
          <h2 id="footer-services-heading" className="footer-services-title mb-4">
            ENN services
          </h2>
          <div className="row g-4 g-lg-5">
            {footerServiceGroups.map((group) => (
              <div key={group.title} className="col-md-6">
                <h3 className="footer-services-col-title mb-3">{group.title}</h3>
                <ul className="footer-services-tags list-unstyled d-flex flex-wrap gap-2 mb-0">
                  {group.links.map((link) => (
                    <li key={link.label}>
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
          </div>
        </div>
      </section>
    </footer>
  );
}
