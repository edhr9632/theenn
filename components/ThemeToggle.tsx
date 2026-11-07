"use client";

import { useEffect, useState } from "react";

export type SiteTheme = "light" | "dark";

const STORAGE_KEY = "enn-theme";

function readTheme(): SiteTheme {
  if (typeof document === "undefined") return "light";
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "dark" || attr === "light") return attr;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    /* ignore */
  }
  return "light";
}

function applyTheme(theme: SiteTheme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}

type ThemeToggleProps = {
  variant?: "topbar" | "header";
};

export default function ThemeToggle({ variant = "header" }: ThemeToggleProps) {
  const [theme, setTheme] = useState<SiteTheme>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTheme(readTheme());
    setReady(true);
  }, []);

  const next = theme === "dark" ? "light" : "dark";
  const label = next === "dark" ? "Switch to dark mode" : "Switch to light mode";

  return (
    <button
      type="button"
      className={`theme-toggle theme-toggle--${variant}${ready ? " is-ready" : ""}`}
      aria-label={label}
      title={label}
      onClick={() => {
        applyTheme(next);
        setTheme(next);
      }}
    >
      <span className="theme-toggle-track" aria-hidden="true">
        <span className="theme-toggle-thumb">
          {theme === "dark" ? (
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
              <path d="M21 14.3A8.5 8.5 0 0 1 9.7 3 7 7 0 1 0 21 14.3z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
              <path d="M12 4.5a1 1 0 0 1 1 1V7a1 1 0 1 1-2 0V5.5a1 1 0 0 1 1-1zm0 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm7.5-4.5a1 1 0 0 1-1 1H17a1 1 0 1 1 0-2h1.5a1 1 0 0 1 1 1zM7 12a1 1 0 0 1-1 1H4.5a1 1 0 1 1 0-2H6a1 1 0 0 1 1 1zm9.95 5.45a1 1 0 0 1-1.4 1.4l-1.06-1.05a1 1 0 1 1 1.41-1.42l1.05 1.07zM8.51 7.1A1 1 0 0 1 7.1 8.51L6.04 7.46A1 1 0 0 1 7.46 6.04L8.51 7.1zm8.39-1.04a1 1 0 0 1 0 1.41L15.85 8.52a1 1 0 1 1-1.41-1.41l1.05-1.05a1 1 0 0 1 1.41 0zM8.52 15.85a1 1 0 0 1-1.41 1.41L6.04 16.2a1 1 0 1 1 1.42-1.41l1.06 1.06zM12 17a1 1 0 0 1 1 1v1.5a1 1 0 1 1-2 0V18a1 1 0 0 1 1-1z" />
            </svg>
          )}
        </span>
      </span>
      <span className="theme-toggle-label d-none d-xl-inline">{theme === "dark" ? "Dark" : "Light"}</span>
    </button>
  );
}

/** Inline bootstrap script — keep in sync with STORAGE_KEY above. */
export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{if(location.pathname.indexOf("/admin")===0){document.documentElement.setAttribute("data-theme","light");return;}var k="enn-theme";var t=localStorage.getItem(k);if(t!=="dark"&&t!=="light"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;
