export interface Article {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author?: string;
  publishDate: Date;
  categories?: string[];
  tags?: string[];
  featuredImage?: string;
  status: 'draft' | 'published';
  readTime?: number;
  lastModified?: Date;
  imageBlurHash?: string;
  relatedArticles?: string[];
  sourceUrl?: string;
  sourceName?: string;
  scrapedAt?: Date;
  isScraped?: boolean;
} 