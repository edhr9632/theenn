"use client";

import Link from "next/link";
import { useEffect } from "react";
import SiteMasthead from "@/components/SiteMasthead";
import { legalNav, type LegalPageData } from "@/lib/legalPages";

function scrollToSection(sectionKey: string) {
  const el = document.querySelector<HTMLElement>(`[data-legal-section="${sectionKey}"]`);
  if (!el) return;

  const stickyOffset = 96;
  const top = el.getBoundingClientRect().top + window.scrollY - stickyOffset;
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}

export default function LegalPageLayout({ page }: { page: LegalPageData }) {
  useEffect(() => {
    // Keep clean routes only — strip any leftover hash fragments from the address bar
    if (window.location.hash) {
      const cleanUrl = `${window.location.pathname}${window.location.search}`;
      window.history.replaceState(null, "", cleanUrl);
    }
  }, [page.slug]);

  return (
    <>
      <SiteMasthead />
      <main className="legal-page">
        <section className="legal-hero" aria-labelledby="legal-hero-heading">
          <div className="container">
            <p className="legal-hero-eyebrow text-uppercase mb-2 mb-lg-3">{page.eyebrow}</p>
            <h1 id="legal-hero-heading" className="legal-hero-title serif-headline mb-3 mb-lg-4">
              {page.title}
            </h1>
            <p className="legal-hero-deck mb-3 mb-lg-4">{page.deck}</p>
            <p className="legal-hero-meta mb-0">Last updated · {page.updated}</p>
          </div>
        </section>

        <nav className="legal-switch" aria-label="Legal pages">
          <div className="container">
            <ul className="legal-switch-list list-unstyled mb-0">
              {legalNav.map((item) => {
                const active = item.href === `/${page.slug}`;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`legal-switch-link${active ? " is-active" : ""}`}
                      aria-current={active ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        <section className="legal-body">
          <div className="container">
            <div className="row g-4 g-xl-5">
              <aside className="col-lg-4 col-xl-3">
                <div className="legal-toc">
                  <p className="legal-toc-label text-uppercase mb-3">On this page</p>
                  <ol className="legal-toc-list list-unstyled mb-0">
                    {page.sections.map((section, index) => (
                      <li key={section.id}>
                        <button
                          type="button"
                          className="legal-toc-link"
                          onClick={() => scrollToSection(section.id)}
                        >
                          <span className="legal-toc-num">{String(index + 1).padStart(2, "0")}</span>
                          <span>{section.title}</span>
                        </button>
                      </li>
                    ))}
                  </ol>
                  <div className="legal-toc-help">
                    <p className="legal-toc-help-title mb-1">Need help?</p>
                    <p className="legal-toc-help-copy mb-2">Questions about our policies are welcome.</p>
                    <Link href="/contact" className="legal-toc-help-link">
                      Contact ENN →
                    </Link>
                  </div>
                </div>
              </aside>

              <div className="col-lg-8 col-xl-9">
                <article className="legal-article">
                  {page.sections.map((section) => (
                    <section key={section.id} data-legal-section={section.id} className="legal-section">
                      <h2 className="legal-section-title serif-headline">{section.title}</h2>
                      {section.paragraphs.map((para) => (
                        <p key={para.slice(0, 48)} className="legal-section-text">
                          {para}
                        </p>
                      ))}
                      {section.bullets?.length ? (
                        <ul className="legal-bullet-list">
                          {section.bullets.map((item) => (
                            <li key={item.slice(0, 48)}>{item}</li>
                          ))}
                        </ul>
                      ) : null}
                    </section>
                  ))}
                </article>

                <div className="legal-footer-nav">
                  <p className="legal-footer-nav-label mb-3">Also in this series</p>
                  <div className="legal-footer-nav-links">
                    {legalNav
                      .filter((item) => item.href !== `/${page.slug}`)
                      .map((item) => (
                        <Link key={item.href} href={item.href} className="legal-footer-card">
                          <span className="legal-footer-card-label">Continue to</span>
                          <span className="legal-footer-card-title serif-headline">{item.label}</span>
                        </Link>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
