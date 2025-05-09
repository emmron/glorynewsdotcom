export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  summary?: string;
  publishDate: Date;
  lastModified?: Date;
  scrapedAt?: Date;
  tags?: string[];
  featuredImage?: string;
  imageUrl?: string;
  author?: string;
  sourceName?: string;
  sourceUrl?: string;
  readTime?: number;
  category?: string;
  club?: string;
}