export type NewsSection = "daily" | "trending" | "press" | "top_education";

export type NewsArticleRow = {
  id: string;
  slug: string;
  section: NewsSection;
  title: string;
  excerpt: string | null;
  content: string | null;
  author: string | null;
  read_time: string | null;
  category_label: string | null;
  image_url: string | null;
  image_alt: string | null;
  featured_video: string | null;
  status: string;
  has_video: boolean;
  is_featured: boolean;
  publish_date: string | null;
  sort_order: number;
};

export type NewsArticleInput = {
  slug: string;
  section: NewsSection;
  title: string;
  excerpt?: string;
  content?: string;
  author?: string;
  readTime?: string;
  categoryLabel?: string;
  imageUrl?: string;
  imageAlt?: string;
  featuredVideo?: string;
  status?: string;
  hasVideo?: boolean;
  publishDate?: string;
  sortOrder?: number;
};
