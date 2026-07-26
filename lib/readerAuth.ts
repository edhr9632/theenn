export const READER_STORAGE_KEY = "enn_reader_session";
export const NEWSLETTER_STORAGE_KEY = "enn_newsletter_emails";
export const SUBSCRIBE_STORAGE_KEY = "enn_subscriber";

export const READER_DEMO = {
  email: "reader@ennnews.com",
  password: "reader123",
  name: "ENN Reader",
};

export type ReaderSession = {
  email: string;
  name: string;
  at: number;
};

export type NewsletterEntry = {
  email: string;
  at: number;
  source?: string;
};

export type SubscriberEntry = {
  email: string;
  name: string;
  plan: string;
  at: number;
};

export function readReaderSession(): ReaderSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(READER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ReaderSession;
    return parsed?.email ? parsed : null;
  } catch {
    return null;
  }
}

export function writeReaderSession(session: Omit<ReaderSession, "at">): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(
      READER_STORAGE_KEY,
      JSON.stringify({ ...session, at: Date.now() } satisfies ReaderSession),
    );
    return true;
  } catch {
    return false;
  }
}

export function clearReaderSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(READER_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function saveNewsletterEmail(email: string, source = "newsletter"): boolean {
  if (typeof window === "undefined") return false;
  const cleaned = email.trim().toLowerCase();
  if (!cleaned || !cleaned.includes("@")) return false;

  try {
    const existingRaw = window.localStorage.getItem(NEWSLETTER_STORAGE_KEY);
    const list: NewsletterEntry[] = existingRaw ? (JSON.parse(existingRaw) as NewsletterEntry[]) : [];
    const without = list.filter((item) => item.email !== cleaned);
    without.unshift({ email: cleaned, at: Date.now(), source });
    window.localStorage.setItem(NEWSLETTER_STORAGE_KEY, JSON.stringify(without.slice(0, 200)));
    return true;
  } catch {
    return false;
  }
}

export function saveSubscription(entry: Omit<SubscriberEntry, "at">): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(
      SUBSCRIBE_STORAGE_KEY,
      JSON.stringify({ ...entry, at: Date.now() } satisfies SubscriberEntry),
    );
    saveNewsletterEmail(entry.email, `subscribe:${entry.plan}`);
    return true;
  } catch {
    return false;
  }
}
