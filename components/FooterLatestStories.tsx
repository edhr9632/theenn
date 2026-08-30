"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { truncateFooterLabel } from "@/lib/footerSeo";

type LatestStory = {
  title: string;
  href: string;
};

export default function FooterLatestStories() {
  const [stories, setStories] = useState<LatestStory[]>([]);

  useEffect(() => {
    let cancelled = false;

    void fetch("/api/ask-enn/prompts")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { latest?: LatestStory[] } | null) => {
        if (cancelled || !data?.latest?.length) return;
        setStories(data.latest);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  if (!stories.length) return null;

  return (
    <div className="col-md-6 col-lg-4">
      <h3 className="footer-services-col-title mb-3">Latest from ENN</h3>
      <ul className="footer-services-tags list-unstyled d-flex flex-wrap gap-2 mb-0">
        {stories.map((story) => (
          <li key={story.href}>
            <Link href={story.href} className="footer-services-tag">
              {truncateFooterLabel(story.title)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
