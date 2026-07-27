export const ASK_ENN_OPEN_EVENT = "enn-ask-open";

export type AskEnnOpenDetail = {
  query?: string;
};

const PENDING_KEY = "__ennAskEnnPending";

declare global {
  interface Window {
    [PENDING_KEY]?: AskEnnOpenDetail | null;
  }
}

export function openAskEnnOverlay(query?: string) {
  if (typeof window === "undefined") return;
  const detail: AskEnnOpenDetail = query?.trim() ? { query: query.trim() } : {};
  // Persist until AskEnnOverlay mounts / handles it (avoids lost events on /ask).
  window[PENDING_KEY] = detail;
  window.dispatchEvent(new CustomEvent(ASK_ENN_OPEN_EVENT, { detail }));
}

export function consumeAskEnnPendingOpen(): AskEnnOpenDetail | null {
  if (typeof window === "undefined") return null;
  const detail = window[PENDING_KEY] ?? null;
  window[PENDING_KEY] = null;
  return detail;
}
