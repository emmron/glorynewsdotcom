export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  publishDate: Date;
  author: string;
  category: string;
  excerpt: string;
  readTime?: number;
  featuredImage?: string;
  tags: string[];
  sourceName?: string;
  sourceUrl?: string;
  lastModified?: Date;
  scrapedAt?: Date;
  isScraped?: boolean;
  club: string;
}