import SiteMasthead from "@/components/SiteMasthead";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Contact Us",
  description:
    "Contact Education News Network in Bengaluru — tips, partnerships, subscriptions, and press inquiries.",
  path: "/contact",
  keywords: ["contact ENN", "Education Today Bengaluru", "education news contact"],
});

const OFFICE_ADDRESS =
  "3rd floor, Sai Sobagu, 461, Outer Ring Rd, Teachers colony, HSR Layout, Bengaluru, Karnataka 560034";
const OFFICE_EMAIL = "info@educationtoday.co";
const OFFICE_PHONE = "7090720000";
const OFFICE_PHONE_HREF = "tel:+917090720000";
const MAP_QUERY = encodeURIComponent(OFFICE_ADDRESS);

const socialLinks = [
  {
    label: "YouTube",
    href: "https://www.youtube.com/@educationtoday7909",
    path: "M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.063l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.007 2.007 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.007 2.007 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31.4 31.4 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.947l.007-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.007 2.007 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.003A99.788 99.788 0 0 1 7.858 2h.193zM6.4 5.209v4.818l4.157-2.408L6.4 5.209z",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/edutodayk12/",
    path: "M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/educationtodayk12",
    path: "M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.555-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.999 0h.001zm-.001 1.442h.001c2.136 0 2.389.009 3.232.047.78.036 1.203.166 1.485.276.373.145.64.318.92.598.28.28.453.546.598.92.11.282.24.705.276 1.485.038.843.047 1.096.047 3.231s-.009 2.389-.047 3.232c-.036.78-.166 1.203-.276 1.485a2.47 2.47 0 0 1-.598.92 2.475 2.475 0 0 1-.92.598c-.282.11-.705.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.598-.92c-.11-.282-.24-.705-.276-1.485-.038-.843-.047-1.096-.047-3.232s.009-2.389.047-3.231c.036-.78.166-1.203.276-1.485.145-.374.318-.64.598-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.846-.038 1.099-.047 3.233-.047z",
  },
];

export default function ContactPage() {
  return (
    <>
      <SiteMasthead activeNav="contact" />
      <main className="contact-page">
        <section className="contact-hero" aria-labelledby="contact-hero-heading">
          <div className="container">
            <p className="contact-hero-eyebrow text-uppercase mb-2 mb-lg-3">We&apos;d love to hear from you.</p>
            <h1 id="contact-hero-heading" className="contact-hero-title serif-headline mb-3 mb-lg-4">
              Contact Us.
            </h1>
            <p className="contact-hero-deck mb-0">
              Tips, partnerships, subscriptions or press inquiries — the whole team is one message away.
            </p>
          </div>
        </section>

        <section className="contact-body py-4 py-lg-5" aria-labelledby="contact-form-heading">
          <div className="container">
            <div className="row g-4 g-lg-5 align-items-start">
              <div className="col-lg-7">
                <h2 id="contact-form-heading" className="visually-hidden">
                  Send us a message
                </h2>
                <form className="contact-form" action="#" method="post">
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="visually-hidden" htmlFor="contact-name">
                        Full name
                      </label>
                      <input
                        type="text"
                        className="form-control contact-field-input rounded-3"
                        id="contact-name"
                        name="name"
                        placeholder="Full name"
                        autoComplete="name"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="visually-hidden" htmlFor="contact-email">
                        Email
                      </label>
                      <input
                        type="email"
                        className="form-control contact-field-input rounded-3"
                        id="contact-email"
                        name="email"
                        placeholder="Email"
                        autoComplete="email"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="visually-hidden" htmlFor="contact-phone">
                        Phone
                      </label>
                      <input
                        type="tel"
                        className="form-control contact-field-input rounded-3"
                        id="contact-phone"
                        name="phone"
                        placeholder="Phone"
                        autoComplete="tel"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="visually-hidden" htmlFor="contact-subject">
                        Subject
                      </label>
                      <input
                        type="text"
                        className="form-control contact-field-input rounded-3"
                        id="contact-subject"
                        name="subject"
                        placeholder="Subject"
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="visually-hidden" htmlFor="contact-message">
                      Message
                    </label>
                    <textarea
                      className="form-control contact-field-input contact-field-textarea rounded-3"
                      id="contact-message"
                      name="message"
                      rows={8}
                      placeholder="Message"
                      required
                    />
                  </div>
                  <button type="submit" className="btn contact-submit-btn px-4 py-2 rounded-3 fw-semibold">
                    Send message
                  </button>
                </form>
              </div>

              <div className="col-lg-5">
                <aside className="contact-office-card bg-white rounded-3 shadow-sm p-4 mb-4">
                  <h2 className="contact-office-title serif-headline mb-4">Office</h2>
                  <ul className="list-unstyled contact-office-list mb-4">
                    <li className="contact-office-item d-flex gap-3">
                      <span className="contact-office-icon flex-shrink-0" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6" />
                        </svg>
                      </span>
                      <p className="contact-office-text mb-0">{OFFICE_ADDRESS}</p>
                    </li>
                    <li className="contact-office-item d-flex gap-3">
                      <span className="contact-office-icon flex-shrink-0" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555ZM0 4.697v7.104l5.803-3.558L0 4.697ZM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586l-1.239-.757Zm3.436-.586L16 11.801V4.697l-5.803 3.116Z" />
                        </svg>
                      </span>
                      <a href={`mailto:${OFFICE_EMAIL}`} className="contact-office-text text-decoration-none">
                        {OFFICE_EMAIL}
                      </a>
                    </li>
                    <li className="contact-office-item d-flex gap-3">
                      <span className="contact-office-icon flex-shrink-0" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z" />
                        </svg>
                      </span>
                      <a href={OFFICE_PHONE_HREF} className="contact-office-text text-decoration-none">
                        {OFFICE_PHONE}
                      </a>
                    </li>
                  </ul>

                  <p className="contact-social-label text-uppercase small fw-semibold mb-2">Social media</p>
                  <div className="contact-office-social d-flex flex-wrap gap-2" aria-label="Social media">
                    {socialLinks.map((social) => (
                      <a
                        key={social.label}
                        href={social.href}
                        className="contact-social-btn"
                        aria-label={social.label}
                        title={social.label}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                          <path d={social.path} />
                        </svg>
                        <span className="contact-social-name">{social.label}</span>
                      </a>
                    ))}
                  </div>
                </aside>

                <div className="contact-map-wrap rounded-3 overflow-hidden shadow-sm">
                  <iframe
                    title="Education Today Bengaluru office location map"
                    className="contact-map-frame"
                    src={`https://maps.google.com/maps?q=${MAP_QUERY}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <a
                    className="contact-map-open"
                    href={`https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open in Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
