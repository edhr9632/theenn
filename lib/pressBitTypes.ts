export type PressBitSourceType = "youtube" | "upload";

export type PressBit = {
  id: string;
  title: string;
  videoUrl: string;
  sourceType: PressBitSourceType;
  image: string;
  year: number;
  category: string;
  sortOrder: number;
  enabled: boolean;
};

export type PressBitInput = {
  title: string;
  videoUrl: string;
  sourceType?: PressBitSourceType;
  imageUrl?: string;
  year: number;
  category: string;
  sortOrder?: number;
  enabled?: boolean;
};
