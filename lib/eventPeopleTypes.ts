export type EventVideoSourceType = "youtube" | "upload";

export function isYoutubeOrShortsUrl(url: string) {
  return /youtube\.com|youtu\.be/i.test(url.trim());
}

export function detectVideoSourceType(url: string): EventVideoSourceType {
  return isYoutubeOrShortsUrl(url) ? "youtube" : "upload";
}

export type SpeakerRecord = {
  id: string;
  name: string;
  role: string;
  image: string;
  category: string;
  year: number;
  videoUrl: string;
  sourceType: EventVideoSourceType;
  sortOrder: number;
};

export type SpeakerInput = {
  name: string;
  role?: string;
  imageUrl?: string;
  category: string;
  year: number;
  videoUrl?: string;
  sourceType?: EventVideoSourceType;
  sortOrder?: number;
};

export type SponsorRecord = {
  id: string;
  name: string;
  tier: string;
  image: string;
  category: string;
  year: number;
  videoUrl: string;
  sourceType: EventVideoSourceType;
  sortOrder: number;
};

export type SponsorInput = {
  name: string;
  tier?: string;
  imageUrl?: string;
  category: string;
  year: number;
  videoUrl?: string;
  sourceType?: EventVideoSourceType;
  sortOrder?: number;
};
