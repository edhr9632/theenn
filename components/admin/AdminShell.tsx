"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ADMIN_NAV, isAdminNavActive, isAdminNavGroupActive } from "@/lib/admin";
import { clearAdminSession, isAdminAuthenticated, readAdminSession } from "@/lib/adminAuth";

function NavIcon({ name }: { name: string }) {
  const common = { width: 18, height: 18, fill: "currentColor", viewBox: "0 0 16 16", "aria-hidden": true as const };
  switch (name) {
    case "dashboard":
      return (
        <svg {...common}>
          <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z" />
        </svg>
      );
    case "news":
      return (
        <svg {...common}>
          <path d="M0 2.5A1.5 1.5 0 0 1 1.5 1h11A1.5 1.5 0 0 1 14 2.5v10.528c0 .3-.05.654-.238.972h.738a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 1 1 0v9a1.5 1.5 0 0 1-1.5 1.5H1.497A1.497 1.497 0 0 1 0 13.5v-11zM12 14c.37 0 .654-.211.853-.5.2-.289.247-.636.247-.972V2.5a.5.5 0 0 0-.5-.5h-11a.5.5 0 0 0-.5.5v11c0 .278.223.5.497.5H12z" />
          <path d="M2 3h5v3H2V3zm6 0h3v1H8V3zm0 2h3v1H8V5zm0 2h3v1H8V7zm0 2h3v1H8V9zm0 2h3v1H8v-1zm-6-1h5v3H2v-3z" />
        </svg>
      );
    case "video":
      return (
        <svg {...common}>
          <path d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1 2-2V5z" />
        </svg>
      );
    case "panels":
      return (
        <svg {...common}>
          <path d="M2.5 3.5a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1h-11zm2-2a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1h-7zM0 13a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 16 13V6a1.5 1.5 0 0 0-1.5-1.5h-13A1.5 1.5 0 0 0 0 6v7zm1.5.5a.5.5 0 0 1-.5-.5V6a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-13z" />
        </svg>
      );
    case "ads":
      return (
        <svg {...common}>
          <path d="M13 2.5a1.5 1.5 0 0 1 3 0v11a1.5 1.5 0 0 1-3 0v-.214c-2.162-1.241-4.49-1.843-6.912-2.083l.645 2.837a.5.5 0 0 1-.172.466l-.922.788a.5.5 0 0 1-.71-.074L3.22 12.5H.5A.5.5 0 0 1 0 12V6a.5.5 0 0 1 .5-.5h2.72l1.71-2.65a.5.5 0 0 1 .71-.074l.922.788a.5.5 0 0 1 .172.466l-.645 2.837C8.51 6.557 10.838 5.955 13 4.714V2.5zm1 0v11a.5.5 0 0 0 1 0v-11a.5.5 0 0 0-1 0zm-1.5 2.158c-1.99.76-3.95 1.206-5.977 1.342l.192-.846a.5.5 0 0 0-.172-.466L5.35 3.5H1v8h4.35l1.193-1.188a.5.5 0 0 0 .172-.466l-.192-.846c2.027.136 3.987.582 5.977 1.342V4.658z" />
        </svg>
      );
    case "mic":
      return (
        <svg {...common}>
          <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z" />
          <path d="M10 8a2 2 0 1 1-4 0V3a2 2 0 1 1 4 0v5z" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
          <path fillRule="evenodd" d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216z" />
          <path d="M4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
        </svg>
      );
    case "briefcase":
      return (
        <svg {...common}>
          <path d="M6.5 1A1.5 1.5 0 0 0 5 2.5V3H1.5A1.5 1.5 0 0 0 0 4.5v8A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 14.5 3H11v-.5A1.5 1.5 0 0 0 9.5 1h-3zm0 1h3a.5.5 0 0 1 .5.5V3H6v-.5a.5.5 0 0 1 .5-.5zm1.886 6.914L15 7.151V12.5a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5V7.15l6.614 1.764a1.5 1.5 0 0 0 .772 0zM1.5 4h13a.5.5 0 0 1 .5.5v1.616L8.129 7.948a.5.5 0 0 1-.258 0L1 6.116V4.5a.5.5 0 0 1 .5-.5z" />
        </svg>
      );
    case "mail":
      return (
        <svg {...common}>
          <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555ZM0 4.697v7.104l5.803-3.558L0 4.697ZM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586l-1.239-.757Zm3.436-.586L16 11.801V4.697l-5.803 3.116Z" />
        </svg>
      );
    case "folder":
      return (
        <svg {...common}>
          <path d="M.54 3.836A1.5 1.5 0 0 1 1.914 3H6.5a.5.5 0 0 1 .4.2l1.1 1.467A.5.5 0 0 0 8.4 5H14.5A1.5 1.5 0 0 1 16 6.5v7a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 13.5V5.118a1.5 1.5 0 0 1 .54-1.282zM1.914 4a.5.5 0 0 0-.458.276L.5 5.118V13.5a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.5-.5H8.4a1.5 1.5 0 0 1-1.2-.6L6.1 4.2A1.5 1.5 0 0 0 4.9 3.5H1.914a.5.5 0 0 0-.1.014z" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z" />
          <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.901 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319z" />
        </svg>
      );
  }
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [userEmail, setUserEmail] = useState("admin@ennnews.com");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (
      pathname.startsWith("/admin/events") ||
      pathname.startsWith("/admin/speakers") ||
      pathname.startsWith("/admin/sponsors")
    ) {
      setEventsOpen(true);
    }
  }, [pathname]);

  useEffect(() => {
    if (isLogin) {
      if (isAdminAuthenticated()) {
        window.location.assign("/admin");
        return;
      }
      setReady(true);
      return;
    }

    const session = readAdminSession();
    if (!session) {
      setReady(false);
      router.replace("/admin/login");
      return;
    }

    setUserEmail(session.email);
    setReady(true);
  }, [pathname, router, isLogin]);

  const logout = () => {
    clearAdminSession();
    setReady(false);
    window.location.assign("/admin/login");
  };

  if (isLogin) {
    return <>{children}</>;
  }

  if (!ready) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-card">Loading admin…</div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar${sidebarOpen ? " is-open" : ""}`}>
        <div className="admin-brand">
          <Link href="/admin" className="admin-brand-logo-link" onClick={() => setSidebarOpen(false)}>
            <Image
              src="/images/ENN.jpg"
              alt="Education News Network"
              width={160}
              height={52}
              className="admin-brand-logo"
              priority
            />
          </Link>
          <div>
            <p className="admin-brand-title mb-0">Admin Console</p>
            <p className="admin-brand-sub mb-0">Education News Network</p>
          </div>
        </div>

        <nav className="admin-nav" aria-label="Admin">
          {ADMIN_NAV.map((item) => {
            if (item.children?.length) {
              const groupActive = isAdminNavGroupActive(pathname, item);
              const parentActive = isAdminNavActive(pathname, item.href);

              return (
                <div key={item.href} className={`admin-nav-group${groupActive ? " is-active" : ""}`}>
                  <div className="admin-nav-group-head">
                    <Link
                      href={item.href}
                      className={`admin-nav-link admin-nav-link--parent${parentActive ? " is-active" : ""}`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <NavIcon name={item.icon} />
                      <span>{item.label}</span>
                    </Link>
                    <button
                      type="button"
                      className={`admin-nav-chevron${eventsOpen ? " is-open" : ""}`}
                      aria-label={eventsOpen ? "Collapse Events menu" : "Expand Events menu"}
                      aria-expanded={eventsOpen}
                      onClick={() => setEventsOpen((open) => !open)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                        <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708" />
                      </svg>
                    </button>
                  </div>
                  {eventsOpen ? (
                    <div className="admin-nav-sub">
                      {item.children.map((child) => {
                        const childActive = isAdminNavActive(pathname, child.href);
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`admin-nav-sublink${childActive ? " is-active" : ""}`}
                            onClick={() => setSidebarOpen(false)}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            }

            const active = isAdminNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-link${active ? " is-active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <NavIcon name={item.icon} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-foot">
          <Link href="/" className="admin-view-site">
            ← View website
          </Link>
          <button type="button" className="admin-logout" onClick={logout}>
            Sign out
          </button>
        </div>
      </aside>

      {sidebarOpen ? (
        <button type="button" className="admin-backdrop" aria-label="Close menu" onClick={() => setSidebarOpen(false)} />
      ) : null}

      <div className="admin-main">
        <header className="admin-topbar">
          <button type="button" className="admin-menu-btn" aria-label="Open menu" onClick={() => setSidebarOpen(true)}>
            ☰
          </button>
          <div className="admin-topbar-brand d-none d-sm-flex align-items-center gap-2">
            <Image src="/images/Enn_logo1.png" alt="" width={150} height={42} className="admin-topbar-logo" />
          </div>
          <div className="admin-topbar-meta ms-auto">
            <p className="admin-topbar-label mb-0">Signed in as</p>
            <p className="admin-topbar-user mb-0">{userEmail}</p>
          </div>
        </header>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
