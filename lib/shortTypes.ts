export type ShortVideo = {
  id: string;
  title: string;
  youtubeUrl: string;
  image: string;
  duration: string;
  meta: string;
  sortOrder: number;
  enabled: boolean;
};

export type ShortVideoInput = {
  title: string;
  youtubeUrl: string;
  imageUrl?: string;
  duration?: string;
  meta?: string;
  sortOrder?: number;
  enabled?: boolean;
};
