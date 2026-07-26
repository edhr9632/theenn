import Image from "next/image";
import SiteMasthead from "@/components/SiteMasthead";
import { siteConfig } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "About",
  description:
    "Learn about Education News Network — independent education journalism covering schools, summits, and policy across India.",
  path: "/about",
  keywords: ["about ENN", "Education News Network", "Education Today", "education journalism"],
});

const stats = [
  {
    value: "12,000+",
    label: "Stories published",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
        <path d="M5 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
      </svg>
    ),
  },
  {
    value: "4",
    label: "Continents covered",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
      </svg>
    ),
  },
  {
    value: "2.4M",
    label: "Monthly readers",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8Zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.367-1.384.727-1.207 1.99-1.616 3.011-1.616s2.284.409 3.011 1.616.367 1.12.367 1.384a.261.261 0 0 1-.022.004H7.022Zm1.99-1.004c.59 0 1.154.247 1.563.634.408.386.753.933.902 1.37h-4.92c.15-.437.494-.984.902-1.37.409-.387.973-.634 1.563-.634Zm-3-4.003h8.99c-.532.73-2.45 2.99-8.99 2.99-6.51 0-8.458-2.26-8.99-2.99h8.99Zm-2.99-2.99c.534.73 2.45 2.99 8.99 2.99 6.51 0 8.458-2.26 8.99-2.99h-8.99Z" />
      </svg>
    ),
  },
  {
    value: "37",
    label: "Journalism awards",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M2.5.5A.5.5 0 0 1 3 0h10a.5.5 0 0 1 .5.5c0 .538-.012 1.05-.034 1.536a3 3 0 1 1-1.133 5.89c-.79 1.865-1.878 2.777-2.833 3.011v2.173l1.425.356c.194.048.377.135.537.255L13.3 15.1a.5.5 0 0 1-.3.9H3a.5.5 0 0 1-.3-.9l1.838-1.379c.16-.12.343-.207.537-.255L6.5 13.11v-2.173c-.955-.234-2.043-1.146-2.833-3.012a3 3 0 1 1-1.132-5.89 33.076 33.076 0 0 1-.034-1.02A.5.5 0 0 1 2.5.5Zm.099 2.54a2 2 0 0 0 .72 3.935c-.333 1.324-.86 2.102-1.554 2.222a1.09 1.09 0 0 0-.218.11c-.287.12-.607.194-.932.194s-.645-.073-.931-.194a1.09 1.09 0 0 0-.218-.11c-.694-.12-1.221-.898-1.554-2.222a2 2 0 0 0 .72-3.935c-.172-.558-.39-.954-.68-1.133-.19-.108-.402-.192-.619-.24a2 2 0 1 1 3.325 0c-.217.048-.429.132-.619.24-.29.18-.508.575-.68 1.133Zm9 0a2 2 0 0 0 .72 3.935c-.333 1.324-.86 2.102-1.554 2.222a1.09 1.09 0 0 0-.218.11c-.287.12-.607.194-.932.194s-.645-.073-.931-.194a1.09 1.09 0 0 0-.218-.11c-.694-.12-1.221-.898-1.554-2.222a2 2 0 0 0 .72-3.935c-.172-.558-.39-.954-.68-1.133-.19-.108-.402-.192-.619-.24a2 2 0 1 1 3.325 0c-.217.048-.429.132-.619.24-.29.18-.508.575-.68 1.133Z" />
      </svg>
    ),
  },
];

const values = [
  {
    num: "01",
    title: "Independence",
    desc: "Our editors answer to readers, not advertisers or agendas. We disclose conflicts, correct mistakes quickly, and separate news from opinion.",
  },
  {
    num: "02",
    title: "Rigor",
    desc: "Every story is sourced, checked, and challenged in the edit room. We prefer being right to being first — without ever slowing down when the public needs answers.",
  },
  {
    num: "03",
    title: "Curiosity",
    desc: "We follow the questions readers ask — from local school boards to global learning technology — and explain why it matters in plain language.",
  },
];

export default function AboutPage() {
  return (
    <>
      <SiteMasthead activeNav="about" />
      <main className="about-page">
        <section className="about-hero" aria-labelledby="about-hero-heading">
          <div className="container">
            <p className="about-hero-eyebrow text-uppercase mb-2 mb-lg-3">About Education News Network</p>
            <h1 id="about-hero-heading" className="about-hero-title serif-headline mb-3 mb-lg-4">
              {siteConfig.tagline}
            </h1>
            <p className="about-hero-deck mb-0">
              We are a newsroom of 140 reporters, editors, photographers and producers across twelve cities, telling the
              stories that shape what comes next.
            </p>
          </div>
        </section>

        <div className="about-stats-wrap">
          <div className="container">
            <div className="row row-cols-2 row-cols-lg-4 g-3 g-lg-4">
              {stats.map((stat) => (
                <div key={stat.label} className="col">
                  <div className="about-stat-card h-100">
                    <div className="about-stat-icon mx-auto">{stat.icon}</div>
                    <p className="about-stat-value serif-headline mb-2">{stat.value}</p>
                    <p className="about-stat-label mb-0">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="about-mission" aria-labelledby="about-mission-heading">
          <div className="container">
            <div className="row align-items-center g-4 g-lg-5">
              <div className="col-lg-6">
                <p className="about-section-eyebrow text-uppercase mb-2">Our mission</p>
                <h2 id="about-mission-heading" className="about-mission-title serif-headline mb-4">
                  Reporting that earns its place in your day.
                </h2>
                <p className="about-mission-text mb-3">
                  Education News Network began as a small team covering schools and universities — and grew into a global
                  newsroom trusted by readers who expect clarity, speed, and depth when policy and classrooms change.
                </p>
                <p className="about-mission-text mb-0">
                  We invest in original reporting, expert analysis, and on-the-ground storytelling because we believe
                  informed communities make better decisions for students, families, and the future of work.
                </p>
              </div>
              <div className="col-lg-6">
                <div className="about-mission-media rounded-3 overflow-hidden shadow">
                  <Image
                    src="https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=1200&q=80"
                    alt="Modern newsroom with monitors and workstations"
                    fill
                    className="object-fit-cover"
                    sizes="(max-width:992px) 100vw, 50vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="about-values" aria-labelledby="about-values-heading">
          <div className="container">
            <p className="about-section-eyebrow text-uppercase text-center mb-2">What we believe</p>
            <h2 id="about-values-heading" className="about-values-title serif-headline text-center mb-0">
              Three commitments
            </h2>
            <div className="about-values-rule mx-auto mt-3 mb-4 mb-lg-5" aria-hidden="true" />
            <div className="row row-cols-1 row-cols-md-3 g-4">
              {values.map((value) => (
                <div key={value.num} className="col">
                  <div className="about-value-card h-100 position-relative bg-white rounded-3 shadow-sm p-4 pt-5">
                    <span className="about-value-num" aria-hidden="true">
                      {value.num}
                    </span>
                    <h3 className="about-value-title serif-headline h5 mb-3">{value.title}</h3>
                    <p className="about-value-desc small text-secondary mb-0">{value.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
