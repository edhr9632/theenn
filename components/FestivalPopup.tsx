"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  FESTIVAL_POPUP_CONFIG,
  resolveActiveFestival,
  type FestivalPopupConfig,
} from "@/lib/festivalPopupConfig";

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function storageGet(key: string, session: boolean) {
  try {
    const store = session ? window.sessionStorage : window.localStorage;
    return store.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key: string, value: string, session: boolean) {
  try {
    const store = session ? window.sessionStorage : window.localStorage;
    store.setItem(key, value);
  } catch {
    /* private mode / blocked storage */
  }
}

function shouldShowPopup(config: FestivalPopupConfig) {
  const { storageKey, showOncePerSession, showOncePerDay } = config;

  if (showOncePerDay) {
    const today = new Date().toISOString().slice(0, 10);
    if (storageGet(`${storageKey}:day`, false) === today) return false;
  }

  if (showOncePerSession) {
    if (storageGet(`${storageKey}:session`, true) === "1") return false;
  }

  return true;
}

function markPopupShown(config: FestivalPopupConfig) {
  const { storageKey, showOncePerSession, showOncePerDay } = config;
  if (showOncePerSession) storageSet(`${storageKey}:session`, "1", true);
  if (showOncePerDay) {
    const today = new Date().toISOString().slice(0, 10);
    storageSet(`${storageKey}:day`, today, false);
  }
}

export default function FestivalPopup() {
  const pathname = usePathname();
  const titleId = useId();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [config, setConfig] = useState<FestivalPopupConfig | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [entered, setEntered] = useState(false);
  const [wishVisible, setWishVisible] = useState(false);

  const festival = useMemo(
    () => (config ? resolveActiveFestival(config) : null),
    [config],
  );

  const hideOnRoute =
    Boolean(pathname?.startsWith("/admin")) ||
    Boolean(pathname?.startsWith("/signin"));

  const close = useCallback(() => {
    setOpen(false);
    setEntered(false);
    setWishVisible(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/festival")
      .then((response) => response.json())
      .then((data: { config?: FestivalPopupConfig | null }) => {
        if (cancelled) return;
        setConfig(data.config ?? FESTIVAL_POPUP_CONFIG);
        setReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        setConfig(FESTIVAL_POPUP_CONFIG);
        setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (hideOnRoute && open) close();
  }, [hideOnRoute, open, close]);

  useEffect(() => {
    if (!ready || hideOnRoute || !config || !festival || !config.enabled) return;
    if (!shouldShowPopup(config)) return;

    markPopupShown(config);
    setOpen(true);

    const reduce = prefersReducedMotion();
    const enterTimer = window.setTimeout(() => setEntered(true), reduce ? 20 : 80);

    return () => {
      window.clearTimeout(enterTimer);
    };
  }, [ready, config, festival, hideOnRoute]);

  useEffect(() => {
    if (!open || !config) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (config.closeOnEscape && event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close, config]);

  if (!open || !festival || !config || hideOnRoute) return null;

  const themeClass = `festival-popup-root--${festival.theme}`;

  const poster = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={festival.image}
      alt={festival.title}
      className="festival-popup-image"
      decoding="async"
      fetchPriority="high"
    />
  );

  return (
    <div
      className={`festival-popup-root ${themeClass}${entered ? " is-entered" : ""}`}
      role="presentation"
    >
      <div
        className="festival-popup-backdrop"
        aria-hidden="true"
        onClick={config.closeOnOutsideClick ? close : undefined}
      />

      <div
        className="festival-popup-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={festival.message ? `${titleId}-msg` : undefined}
      >
        <button
          ref={closeBtnRef}
          type="button"
          className="festival-popup-close"
          aria-label="Close festival greeting"
          onClick={close}
        >
          <span aria-hidden="true">×</span>
        </button>

        <div className="festival-popup-stage">
          <p className="festival-popup-eyebrow" aria-hidden="true">
            Education News Network
          </p>

          <div
            className={`festival-popup-card${wishVisible ? " is-wish-visible" : ""}`}
            onMouseEnter={() => setWishVisible(true)}
            onMouseLeave={() => setWishVisible(false)}
            onFocus={() => setWishVisible(true)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setWishVisible(false);
              }
            }}
            onClick={(event) => {
              if ((event.target as HTMLElement).closest("a, button")) return;
              setWishVisible((current) => !current);
            }}
          >
            <h2 id={titleId} className="visually-hidden">
              {festival.title}
            </h2>
            {festival.href ? (
              <Link
                href={festival.href}
                className="festival-popup-link"
                onClick={close}
                aria-label={festival.title}
              >
                {poster}
              </Link>
            ) : (
              poster
            )}

            <div className="festival-popup-wish" aria-hidden={!wishVisible}>
              <p className="festival-popup-title" aria-hidden="true">
                {festival.title}
              </p>
              {festival.subtitle ? (
                <p className="festival-popup-subtitle">{festival.subtitle}</p>
              ) : null}
              {festival.message ? (
                <p id={`${titleId}-msg`} className="festival-popup-message">
                  {festival.message}
                </p>
              ) : null}
            </div>
            <p className="festival-popup-hover-hint" aria-hidden="true">
              Hover to read the greeting
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
