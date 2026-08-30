import "server-only";

import { isDbConfigured, query, queryOne } from "@/lib/db";
import {
  createWeeklyId,
  DEFAULT_WEEKLY_CITIES,
  slugifyWeekly,
  type AdminWeeklyIssue,
  type WeeklyAdminState,
  type WeeklyCity,
  type WeeklyCityInput,
  type WeeklyHighlight,
  type WeeklyIssueInput,
} from "@/lib/weeklyTypes";

export type {
  AdminWeeklyIssue,
  WeeklyAdminState,
  WeeklyCity,
  WeeklyCityInput,
  WeeklyHighlight,
  WeeklyIssueInput,
} from "@/lib/weeklyTypes";

type CityRow = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
};

type IssueRow = {
  slug: string;
  city_id: string;
  date_label: string;
  weekday: string | null;
  title: string;
  tagline: string | null;
  cover_image: string | null;
  pdf_url: string | null;
  highlights: WeeklyHighlight[] | string | null;
  is_featured: boolean;
  sort_order: number;
  city_name?: string;
};

const HIGHLIGHT_TONES = ["red", "blue", "purple", "teal", "ink"] as const;

function parseHighlights(raw: IssueRow["highlights"]): WeeklyHighlight[] {
  if (!raw) return [];
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as WeeklyHighlight[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return Array.isArray(raw) ? raw : [];
}

function mapCity(row: CityRow): WeeklyCity {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    sortOrder: row.sort_order,
  };
}

function mapIssue(row: IssueRow): AdminWeeklyIssue {
  return {
    slug: row.slug,
    cityId: row.city_id,
    cityName: row.city_name?.trim() || "",
    dateLabel: row.date_label,
    weekday: row.weekday?.trim() || "",
    title: row.title,
    tagline: row.tagline?.trim() || "",
    coverImage: row.cover_image?.trim() || "",
    pdfUrl: row.pdf_url?.trim() || "",
    highlights: parseHighlights(row.highlights),
    featured: row.is_featured,
  };
}

async function loadCities(): Promise<CityRow[]> {
  return query<CityRow>(
    `SELECT id, name, slug, sort_order
     FROM weekly_cities
     ORDER BY sort_order ASC, name ASC`,
  );
}

async function loadIssues(): Promise<IssueRow[]> {
  return query<IssueRow>(
    `SELECT i.slug, i.city_id, i.date_label, i.weekday, i.title, i.tagline,
            i.cover_image, i.pdf_url, i.highlights, i.is_featured, i.sort_order,
            c.name AS city_name
     FROM weekly_issues i
     JOIN weekly_cities c ON c.id = i.city_id
     ORDER BY i.city_id, i.is_featured DESC, i.sort_order ASC, i.updated_at DESC`,
  );
}

function emptyState(): WeeklyAdminState {
  return { cities: [], issues: [] };
}

export async function getWeeklyAdminState(): Promise<WeeklyAdminState> {
  if (!isDbConfigured()) return emptyState();

  try {
    const [cityRows, issueRows] = await Promise.all([loadCities(), loadIssues()]);
    return {
      cities: cityRows.map(mapCity),
      issues: issueRows.map(mapIssue),
    };
  } catch (error) {
    console.error("[getWeeklyAdminState]", error);
    return emptyState();
  }
}

export async function getWeeklyIssueBySlug(slug: string): Promise<AdminWeeklyIssue | null> {
  if (!isDbConfigured()) return null;

  const row = await queryOne<IssueRow>(
    `SELECT i.slug, i.city_id, i.date_label, i.weekday, i.title, i.tagline,
            i.cover_image, i.pdf_url, i.highlights, i.is_featured, i.sort_order,
            c.name AS city_name
     FROM weekly_issues i
     JOIN weekly_cities c ON c.id = i.city_id
     WHERE i.slug = $1
     LIMIT 1`,
    [slug],
  );

  return row ? mapIssue(row) : null;
}

export async function createWeeklyCity(input: WeeklyCityInput): Promise<WeeklyCity | null> {
  if (!isDbConfigured()) return null;

  const name = input.name.trim();
  if (!name) throw new Error("City name is required.");

  const id = createWeeklyId("city");
  let slug = slugifyWeekly(name) || id;

  const clash = await queryOne<{ id: string }>(
    `SELECT id FROM weekly_cities WHERE slug = $1 LIMIT 1`,
    [slug],
  );
  if (clash) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  const row = await queryOne<CityRow>(
    `INSERT INTO weekly_cities (id, name, slug, sort_order, updated_at)
     VALUES ($1, $2, $3, (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM weekly_cities), NOW())
     RETURNING id, name, slug, sort_order`,
    [id, name, slug],
  );

  return row ? mapCity(row) : null;
}

export async function deleteWeeklyCity(id: string): Promise<boolean> {
  if (!isDbConfigured()) return false;
  const row = await queryOne<{ id: string }>(
    `DELETE FROM weekly_cities WHERE id = $1 RETURNING id`,
    [id],
  );
  return Boolean(row);
}

export async function resetWeeklyCitiesToDefaults(): Promise<WeeklyCity[]> {
  if (!isDbConfigured()) return [];

  for (const city of DEFAULT_WEEKLY_CITIES) {
    await query(
      `INSERT INTO weekly_cities (id, name, slug, sort_order, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         slug = EXCLUDED.slug,
         sort_order = EXCLUDED.sort_order,
         updated_at = NOW()`,
      [city.id, city.name, city.slug, city.sortOrder ?? 0],
    );
  }

  const cities = await loadCities();
  return cities.map(mapCity);
}

function normalizeHighlights(highlights?: WeeklyHighlight[]): WeeklyHighlight[] {
  if (!highlights?.length) return [];
  return highlights.map((item, index) => ({
    label: item.label.trim(),
    tone: HIGHLIGHT_TONES.includes(item.tone) ? item.tone : HIGHLIGHT_TONES[index % HIGHLIGHT_TONES.length],
  }));
}

async function clearFeaturedForCity(cityId: string, exceptSlug?: string) {
  if (exceptSlug) {
    await query(
      `UPDATE weekly_issues SET is_featured = FALSE, updated_at = NOW()
       WHERE city_id = $1 AND slug <> $2`,
      [cityId, exceptSlug],
    );
  } else {
    await query(
      `UPDATE weekly_issues SET is_featured = FALSE, updated_at = NOW()
       WHERE city_id = $1`,
      [cityId],
    );
  }
}

export async function createWeeklyIssue(input: WeeklyIssueInput): Promise<AdminWeeklyIssue | null> {
  if (!isDbConfigured()) return null;

  const city = await queryOne<{ id: string; name: string }>(
    `SELECT id, name FROM weekly_cities WHERE id = $1 LIMIT 1`,
    [input.cityId],
  );
  if (!city) throw new Error("City not found.");

  const title = input.title.trim();
  const coverImage = input.coverImage.trim();
  const pdfUrl = input.pdfUrl.trim();
  if (!title || !coverImage || !pdfUrl) {
    throw new Error("Title, cover image, and PDF are required.");
  }

  let slug = slugifyWeekly(input.slug?.trim() || `${city.name}-${input.dateLabel}`) || createWeeklyId("week");
  const clash = await queryOne<{ slug: string }>(
    `SELECT slug FROM weekly_issues WHERE slug = $1 LIMIT 1`,
    [slug],
  );
  if (clash) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  const featured = Boolean(input.featured);
  if (featured) await clearFeaturedForCity(city.id);

  const row = await queryOne<IssueRow>(
    `INSERT INTO weekly_issues (
       slug, city_id, date_label, weekday, title, tagline, cover_image, pdf_url,
       highlights, is_featured, sort_order, updated_at
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11,NOW())
     RETURNING slug, city_id, date_label, weekday, title, tagline, cover_image, pdf_url,
               highlights, is_featured, sort_order`,
    [
      slug,
      city.id,
      input.dateLabel.trim(),
      input.weekday.trim(),
      title,
      input.tagline?.trim() || null,
      coverImage,
      pdfUrl,
      JSON.stringify(normalizeHighlights(input.highlights)),
      featured,
      Number.isFinite(input.sortOrder) ? Number(input.sortOrder) : 0,
    ],
  );

  return row ? { ...mapIssue(row), cityName: city.name } : null;
}

export async function updateWeeklyIssue(
  originalSlug: string,
  input: WeeklyIssueInput,
): Promise<AdminWeeklyIssue | null> {
  if (!isDbConfigured()) return null;

  const existing = await queryOne<{ slug: string; city_id: string }>(
    `SELECT slug, city_id FROM weekly_issues WHERE slug = $1 LIMIT 1`,
    [originalSlug],
  );
  if (!existing) return null;

  const city = await queryOne<{ id: string; name: string }>(
    `SELECT id, name FROM weekly_cities WHERE id = $1 LIMIT 1`,
    [input.cityId],
  );
  if (!city) throw new Error("City not found.");

  const title = input.title.trim();
  const coverImage = input.coverImage.trim();
  const pdfUrl = input.pdfUrl.trim();
  if (!title || !coverImage || !pdfUrl) {
    throw new Error("Title, cover image, and PDF are required.");
  }

  let slug = slugifyWeekly(input.slug?.trim() || originalSlug) || originalSlug;
  if (slug !== originalSlug) {
    const clash = await queryOne<{ slug: string }>(
      `SELECT slug FROM weekly_issues WHERE slug = $1 AND slug <> $2 LIMIT 1`,
      [slug, originalSlug],
    );
    if (clash) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  }

  const featured = Boolean(input.featured);
  if (featured) await clearFeaturedForCity(city.id, slug);

  const row = await queryOne<IssueRow>(
    `UPDATE weekly_issues SET
       slug = $2,
       city_id = $3,
       date_label = $4,
       weekday = $5,
       title = $6,
       tagline = $7,
       cover_image = $8,
       pdf_url = $9,
       highlights = $10::jsonb,
       is_featured = $11,
       sort_order = $12,
       updated_at = NOW()
     WHERE slug = $1
     RETURNING slug, city_id, date_label, weekday, title, tagline, cover_image, pdf_url,
               highlights, is_featured, sort_order`,
    [
      originalSlug,
      slug,
      city.id,
      input.dateLabel.trim(),
      input.weekday.trim(),
      title,
      input.tagline?.trim() || null,
      coverImage,
      pdfUrl,
      JSON.stringify(normalizeHighlights(input.highlights)),
      featured,
      Number.isFinite(input.sortOrder) ? Number(input.sortOrder) : 0,
    ],
  );

  return row ? { ...mapIssue(row), cityName: city.name } : null;
}

export async function deleteWeeklyIssue(slug: string): Promise<boolean> {
  if (!isDbConfigured()) return false;
  const row = await queryOne<{ slug: string }>(
    `DELETE FROM weekly_issues WHERE slug = $1 RETURNING slug`,
    [slug],
  );
  return Boolean(row);
}
