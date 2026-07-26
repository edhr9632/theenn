import "server-only";

import { queryOne } from "@/lib/db";
import type { PromoBanner } from "@/lib/homeTypes";

export type { PromoBanner } from "@/lib/homeTypes";

type PromoBannerRow = {
  id: string;
  enabled: boolean;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  cta_label: string | null;
  cta_url: string | null;
  variant: string;
};

function mapPromo(row: PromoBannerRow): PromoBanner {
  return {
    id: row.id,
    enabled: row.enabled,
    eyebrow: row.eyebrow?.trim() || "",
    title: row.title,
    subtitle: row.subtitle?.trim() || "",
    ctaLabel: row.cta_label?.trim() || "Learn more",
    ctaUrl: row.cta_url?.trim() || "#",
    variant: row.variant,
  };
}

export async function getPromoBanner(id: string): Promise<PromoBanner | null> {
  const row = await queryOne<PromoBannerRow>(
    `SELECT id, enabled, eyebrow, title, subtitle, cta_label, cta_url, variant
     FROM site_promo_banners WHERE id = $1 AND enabled = TRUE LIMIT 1`,
    [id],
  );
  return row ? mapPromo(row) : null;
}
