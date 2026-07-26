"use client";

import { useCallback, useMemo, useState } from "react";
import { siteSeo } from "@/lib/seo";

type ArticleShareBarProps = {
  title: string;
  excerpt?: string;
  path: string;
};

function buildShareLinks(url: string, title: string, excerpt?: string) {
  const text = excerpt ? `${title} — ${excerpt}` : title;
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);

  return {
    copy: url,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(title)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodedText}%0A%0A${encodedUrl}`,
  };
}

function IconShare() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCopy() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconX() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.894L2.25 2.25h6.593l4.263 5.686L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94z" />
    </svg>
  );
}

function IconLinkedIn() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  );
}

function IconWhatsApp() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.52 3.48A11.78 11.78 0 0 0 12.06 0C5.46 0 .1 5.35.1 11.94c0 2.1.55 4.16 1.6 5.98L0 24l6.25-1.64a11.9 11.9 0 0 0 5.8 1.48h.01c6.6 0 11.95-5.36 11.95-11.95 0-3.19-1.24-6.19-3.49-8.41zM12.06 21.3h-.01a9.35 9.35 0 0 1-4.76-1.3l-.34-.2-3.71.97.99-3.62-.22-.37a9.33 9.33 0 0 1-1.43-4.98c0-5.16 4.2-9.36 9.37-9.36 2.5 0 4.85.97 6.62 2.74a9.3 9.3 0 0 1 2.74 6.62c0 5.16-4.2 9.5-9.25 9.5zm5.43-7.02c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.5s1.07 2.9 1.22 3.1c.15.2 2.11 3.22 5.11 4.52.71.31 1.27.49 1.7.63.72.23 1.37.2 1.89.12.58-.09 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" />
    </svg>
  );
}

function IconEmail() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function ArticleShareBar({ title, excerpt, path }: ArticleShareBarProps) {
  const [note, setNote] = useState("");

  // Keep URL identical on server and client (no window.location during render).
  const shareUrl = useMemo(() => {
    const origin = siteSeo.siteUrl.replace(/\/$/, "");
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${origin}${normalizedPath}`;
  }, [path]);

  const links = useMemo(() => buildShareLinks(shareUrl, title, excerpt), [shareUrl, title, excerpt]);

  const flash = useCallback((message: string) => {
    setNote(message);
    window.setTimeout(() => setNote(""), 2200);
  }, []);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(links.copy);
      flash("Link copied!");
    } catch {
      flash("Copy failed");
    }
  }, [flash, links.copy]);

  const onNativeShare = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, text: excerpt, url: shareUrl });
        return;
      }
      await onCopy();
    } catch {
      /* cancelled */
    }
  }, [excerpt, onCopy, shareUrl, title]);

  return (
    <section className="article-share-bar" aria-label="Share this article">
      <div className="article-share-bar-head">
        <div>
          <p className="article-share-eyebrow mb-1">Share</p>
          <h2 className="article-share-bar-title serif-headline h5 mb-0">Share this article</h2>
        </div>
        {note ? <span className="article-share-bar-note">{note}</span> : null}
      </div>

      <div className="article-share-icon-row">
        <button type="button" className="article-share-tile article-share-tile--primary" onClick={onNativeShare}>
          <span className="article-share-tile-icon">
            <IconShare />
          </span>
          <span className="article-share-tile-label">Share</span>
        </button>
        <button type="button" className="article-share-tile" onClick={onCopy}>
          <span className="article-share-tile-icon">
            <IconCopy />
          </span>
          <span className="article-share-tile-label">Copy</span>
        </button>
        <a className="article-share-tile" href={links.twitter} target="_blank" rel="noopener noreferrer">
          <span className="article-share-tile-icon">
            <IconX />
          </span>
          <span className="article-share-tile-label">X</span>
        </a>
        <a className="article-share-tile" href={links.facebook} target="_blank" rel="noopener noreferrer">
          <span className="article-share-tile-icon">
            <IconFacebook />
          </span>
          <span className="article-share-tile-label">Facebook</span>
        </a>
        <a className="article-share-tile" href={links.linkedin} target="_blank" rel="noopener noreferrer">
          <span className="article-share-tile-icon">
            <IconLinkedIn />
          </span>
          <span className="article-share-tile-label">LinkedIn</span>
        </a>
        <a className="article-share-tile" href={links.whatsapp} target="_blank" rel="noopener noreferrer">
          <span className="article-share-tile-icon">
            <IconWhatsApp />
          </span>
          <span className="article-share-tile-label">WhatsApp</span>
        </a>
        <a className="article-share-tile" href={links.email}>
          <span className="article-share-tile-icon">
            <IconEmail />
          </span>
          <span className="article-share-tile-label">Email</span>
        </a>
      </div>
    </section>
  );
}
