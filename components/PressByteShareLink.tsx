"use client";

import { useState } from "react";

type PressByteShareLinkProps = {
  url: string;
};

export default function PressByteShareLink({ url }: PressByteShareLinkProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  };

  return (
    <div className="press-byte-share">
      <p className="press-byte-share-label mb-2">Full share link</p>
      <div className="press-byte-share-row">
        <a className="press-byte-share-url" href={url} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
        <button type="button" className="press-byte-share-copy" onClick={() => void onCopy()}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
