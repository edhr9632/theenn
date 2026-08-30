import "server-only";

import { isDbConfigured, query, queryOne } from "@/lib/db";
import {
  resolveActiveFestival,
  type FestivalPopupConfig,
  type FestivalTheme,
} from "@/lib/festivalPopupConfig";
import {
  createFestivalPostId,
  type FestivalAdminState,
  type FestivalConfigInput,
  type FestivalConfigSettings,
  type FestivalPost,
  type FestivalPostInput,
} from "@/lib/festivalTypes";

export type {
  FestivalAdminState,
  FestivalConfigInput,
  FestivalConfigSettings,
  FestivalPost,
  FestivalPostInput,
} from "@/lib/festivalTypes";

type ConfigRow = {
  enabled: boolean;
  active_post_id: string | null;
  show_once_per_session: boolean;
  show_once_per_day: boolean;
  close_on_outside_click: boolean;
  close_on_escape: boolean;
  confetti_enabled: boolean;
  confetti_count: number;
  animation_duration: number;
  storage_key: string;
};

type PostRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  message: string | null;
  image_url: string;
  theme: string;
  href: string | null;
  top_bar_ticker_text: string | null;
  listen_intro_text: string | null;
  is_published: boolean;
  sort_order: number;
  updated_at?: string | Date;
};

const THEMES = new Set<FestivalTheme>(["default", "onam", "diwali", "holi", "independence"]);

function normalizeTheme(value: string | null | undefined): FestivalTheme {
  if (value && THEMES.has(value as FestivalTheme)) return value as FestivalTheme;
  return "default";
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function mapPost(row: PostRow): FestivalPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle?.trim() || "",
    message: row.message?.trim() || "",
    imageUrl: row.image_url.trim(),
    theme: normalizeTheme(row.theme),
    href: row.href?.trim() || "",
    topBarTickerText: row.top_bar_ticker_text?.trim() || "",
    listenIntroText: row.listen_intro_text?.trim() || "",
    published: row.is_published,
    sortOrder: row.sort_order,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
  };
}

function mapConfig(row: ConfigRow): FestivalConfigSettings {
  return {
    enabled: row.enabled,
    activePostId: row.active_post_id,
    showOncePerSession: row.show_once_per_session,
    showOncePerDay: row.show_once_per_day,
    closeOnOutsideClick: row.close_on_outside_click,
    closeOnEscape: row.close_on_escape,
    confettiEnabled: row.confetti_enabled,
    confettiCount: row.confetti_count,
    animationDuration: row.animation_duration,
    storageKey: row.storage_key?.trim() || "enn-festival-popup",
  };
}

function fileFallbackState(): FestivalAdminState {
  return {
    enabled: false,
    activePostId: null,
    showOncePerSession: false,
    showOncePerDay: false,
    closeOnOutsideClick: true,
    closeOnEscape: true,
    confettiEnabled: false,
    confettiCount: 0,
    animationDuration: 900,
    storageKey: "enn-festival-popup",
    posts: [],
  };
}

async function loadConfigRow(): Promise<ConfigRow | null> {
  return queryOne<ConfigRow>(
    `SELECT enabled, active_post_id, show_once_per_session, show_once_per_day,
            close_on_outside_click, close_on_escape, confetti_enabled, confetti_count,
            animation_duration, storage_key
     FROM site_festival_config WHERE id = 1 LIMIT 1`,
  );
}

async function loadPostRows(): Promise<PostRow[]> {
  return query<PostRow>(
    `SELECT id, slug, title, subtitle, message, image_url, theme, href,
            top_bar_ticker_text, listen_intro_text, is_published, sort_order, updated_at
     FROM site_festival_posts
     ORDER BY sort_order ASC, updated_at DESC`,
  );
}

async function loadPostById(id: string): Promise<PostRow | null> {
  return queryOne<PostRow>(
    `SELECT id, slug, title, subtitle, message, image_url, theme, href,
            top_bar_ticker_text, listen_intro_text, is_published, sort_order, updated_at
     FROM site_festival_posts WHERE id = $1 LIMIT 1`,
    [id],
  );
}

export async function getFestivalAdminState(): Promise<FestivalAdminState> {
  if (!isDbConfigured()) return fileFallbackState();

  try {
    const [configRow, postRows] = await Promise.all([loadConfigRow(), loadPostRows()]);
    if (!configRow) return fileFallbackState();

    return {
      ...mapConfig(configRow),
      posts: postRows.map(mapPost),
    };
  } catch (error) {
    console.error("[getFestivalAdminState]", error);
    return fileFallbackState();
  }
}

/** Maps admin/DB state into the shape FestivalPopup already understands. */
export function toFestivalPopupConfig(state: FestivalAdminState): FestivalPopupConfig {
  const active =
    state.posts.find((post) => post.id === state.activePostId && post.published) ??
    state.posts.find((post) => post.id === state.activePostId) ??
    null;

  return {
    enabled: state.enabled && Boolean(active?.imageUrl),
    activeFestival: null,
    image: active?.imageUrl,
    title: active?.title,
    subtitle: active?.subtitle || undefined,
    message: active?.message || undefined,
    theme: active?.theme,
    href: active?.href || undefined,
    topBarTickerText: active?.topBarTickerText || undefined,
    showOncePerSession: state.showOncePerSession,
    showOncePerDay: state.showOncePerDay,
    closeOnOutsideClick: state.closeOnOutsideClick,
    closeOnEscape: state.closeOnEscape,
    confettiEnabled: state.confettiEnabled,
    confettiCount: state.confettiCount,
    animationDuration: state.animationDuration,
    storageKey: state.storageKey,
  };
}

export async function getPublicFestivalPopupConfig(): Promise<FestivalPopupConfig> {
  const state = await getFestivalAdminState();
  return toFestivalPopupConfig(state);
}

export async function getFestivalTopBarTickerFromDb(): Promise<string> {
  const config = await getPublicFestivalPopupConfig();
  if (!config.enabled) return "";
  const text = config.topBarTickerText?.trim();
  if (text) return text;
  const festival = resolveActiveFestival(config);
  return festival?.title ? `${festival.title} — warm wishes from Education News Network` : "";
}

export async function getActiveFestivalListenIntro(): Promise<string> {
  const state = await getFestivalAdminState();
  if (!state.enabled) return "";
  const active =
    state.posts.find((post) => post.id === state.activePostId && post.published) ?? null;
  return active?.listenIntroText?.trim() || "";
}

export async function updateFestivalConfig(input: FestivalConfigInput): Promise<FestivalAdminState | null> {
  if (!isDbConfigured()) return null;

  const current = await getFestivalAdminState();
  const next: FestivalConfigSettings = {
    enabled: input.enabled ?? current.enabled,
    activePostId: input.activePostId !== undefined ? input.activePostId : current.activePostId,
    showOncePerSession: input.showOncePerSession ?? current.showOncePerSession,
    showOncePerDay: input.showOncePerDay ?? current.showOncePerDay,
    closeOnOutsideClick: input.closeOnOutsideClick ?? current.closeOnOutsideClick,
    closeOnEscape: input.closeOnEscape ?? current.closeOnEscape,
    confettiEnabled: input.confettiEnabled ?? current.confettiEnabled,
    confettiCount: input.confettiCount ?? current.confettiCount,
    animationDuration: input.animationDuration ?? current.animationDuration,
    storageKey: (input.storageKey?.trim() || current.storageKey || "enn-festival-popup").trim(),
  };

  if (next.activePostId) {
    const exists = await loadPostById(next.activePostId);
    if (!exists) {
      throw new Error("Active festival post was not found.");
    }
  }

  await query(
    `INSERT INTO site_festival_config (
       id, enabled, active_post_id, show_once_per_session, show_once_per_day,
       close_on_outside_click, close_on_escape, confetti_enabled, confetti_count,
       animation_duration, storage_key, updated_at
     ) VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
     ON CONFLICT (id) DO UPDATE SET
       enabled = EXCLUDED.enabled,
       active_post_id = EXCLUDED.active_post_id,
       show_once_per_session = EXCLUDED.show_once_per_session,
       show_once_per_day = EXCLUDED.show_once_per_day,
       close_on_outside_click = EXCLUDED.close_on_outside_click,
       close_on_escape = EXCLUDED.close_on_escape,
       confetti_enabled = EXCLUDED.confetti_enabled,
       confetti_count = EXCLUDED.confetti_count,
       animation_duration = EXCLUDED.animation_duration,
       storage_key = EXCLUDED.storage_key,
       updated_at = NOW()`,
    [
      next.enabled,
      next.activePostId,
      next.showOncePerSession,
      next.showOncePerDay,
      next.closeOnOutsideClick,
      next.closeOnEscape,
      next.confettiEnabled,
      next.confettiCount,
      next.animationDuration,
      next.storageKey,
    ],
  );

  return getFestivalAdminState();
}

export async function createFestivalPost(input: FestivalPostInput): Promise<FestivalPost | null> {
  if (!isDbConfigured()) return null;

  const title = input.title.trim();
  const imageUrl = input.imageUrl.trim();
  if (!title || !imageUrl) throw new Error("Title and image are required.");

  const id = createFestivalPostId();
  let slug = slugify(input.slug?.trim() || title) || id;
  const existingSlug = await queryOne<{ id: string }>(
    `SELECT id FROM site_festival_posts WHERE slug = $1 LIMIT 1`,
    [slug],
  );
  if (existingSlug) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  const row = await queryOne<PostRow>(
    `INSERT INTO site_festival_posts (
       id, slug, title, subtitle, message, image_url, theme, href,
       top_bar_ticker_text, listen_intro_text, is_published, sort_order, updated_at
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12, NOW())
     RETURNING id, slug, title, subtitle, message, image_url, theme, href,
               top_bar_ticker_text, listen_intro_text, is_published, sort_order, updated_at`,
    [
      id,
      slug,
      title,
      input.subtitle?.trim() || null,
      input.message?.trim() || null,
      imageUrl,
      normalizeTheme(input.theme),
      input.href?.trim() || null,
      input.topBarTickerText?.trim() || null,
      input.listenIntroText?.trim() || null,
      input.published !== false,
      Number.isFinite(input.sortOrder) ? Number(input.sortOrder) : 0,
    ],
  );

  return row ? mapPost(row) : null;
}

export async function updateFestivalPost(id: string, input: FestivalPostInput): Promise<FestivalPost | null> {
  if (!isDbConfigured()) return null;

  const title = input.title.trim();
  const imageUrl = input.imageUrl.trim();
  if (!title || !imageUrl) throw new Error("Title and image are required.");

  let slug = slugify(input.slug?.trim() || title) || id;
  const clash = await queryOne<{ id: string }>(
    `SELECT id FROM site_festival_posts WHERE slug = $1 AND id <> $2 LIMIT 1`,
    [slug, id],
  );
  if (clash) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  const row = await queryOne<PostRow>(
    `UPDATE site_festival_posts SET
       slug = $2,
       title = $3,
       subtitle = $4,
       message = $5,
       image_url = $6,
       theme = $7,
       href = $8,
       top_bar_ticker_text = $9,
       listen_intro_text = $10,
       is_published = $11,
       sort_order = $12,
       updated_at = NOW()
     WHERE id = $1
     RETURNING id, slug, title, subtitle, message, image_url, theme, href,
               top_bar_ticker_text, listen_intro_text, is_published, sort_order, updated_at`,
    [
      id,
      slug,
      title,
      input.subtitle?.trim() || null,
      input.message?.trim() || null,
      imageUrl,
      normalizeTheme(input.theme),
      input.href?.trim() || null,
      input.topBarTickerText?.trim() || null,
      input.listenIntroText?.trim() || null,
      input.published !== false,
      Number.isFinite(input.sortOrder) ? Number(input.sortOrder) : 0,
    ],
  );

  return row ? mapPost(row) : null;
}

export async function deleteFestivalPost(id: string): Promise<boolean> {
  if (!isDbConfigured()) return false;
  const row = await queryOne<{ id: string }>(
    `DELETE FROM site_festival_posts WHERE id = $1 RETURNING id`,
    [id],
  );
  return Boolean(row);
}
