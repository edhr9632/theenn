"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type SiteMastheadStickyFrameProps = {
  children: ReactNode;
};

export default function SiteMastheadStickyFrame({ children }: SiteMastheadStickyFrameProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    setReady(true);
  }, []);

  useLayoutEffect(() => {
    if (!ready) return;

    const header = headerRef.current;
    const placeholder = placeholderRef.current;
    if (!header || !placeholder) return;

    const promo = document.getElementById("site-masthead-promo");

    const sync = () => {
      const promoHeight = promo?.offsetHeight ?? 0;
      const headerHeight = header.offsetHeight;
      const scrollY = window.scrollY;
      const top = Math.max(0, promoHeight - scrollY);
      const isPinned = scrollY >= Math.max(0, promoHeight - 1);

      header.style.top = `${top}px`;
      placeholder.style.height = `${headerHeight}px`;
      document.documentElement.style.setProperty("--site-header-height", `${headerHeight}px`);

      setPinned(isPinned);
      setScrolled(scrollY > 48);
    };

    sync();

    const resizeObserver = new ResizeObserver(sync);
    resizeObserver.observe(header);
    if (promo) resizeObserver.observe(promo);

    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [ready]);

  const headerNode = (
    <div
      ref={headerRef}
      className={`site-masthead-sticky${pinned ? " is-pinned" : ""}${scrolled ? " is-scrolled" : ""}`}
    >
      {children}
    </div>
  );

  return (
    <>
      <div ref={placeholderRef} className="site-masthead-placeholder" aria-hidden="true" />
      {ready ? createPortal(headerNode, document.body) : headerNode}
    </>
  );
}
