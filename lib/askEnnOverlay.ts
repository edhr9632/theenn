export const ASK_ENN_OPEN_EVENT = "enn-ask-open";

export type AskEnnOpenDetail = {
  query?: string;
};

export function openAskEnnOverlay(query?: string) {
  if (typeof window === "undefined") return;
  const detail: AskEnnOpenDetail = query?.trim() ? { query: query.trim() } : {};
  window.dispatchEvent(new CustomEvent(ASK_ENN_OPEN_EVENT, { detail }));
}
