export interface Article {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  publishDate: Date;
  featuredImage: string;
  sourceName: string;
  sourceUrl: string;
  scrapedAt: Date;
  isScraped: boolean;
  status: 'draft' | 'published';
  categories?: string[];
  tags?: string[];
  author?: string;
  readTime?: number;
  lastModified?: Date;
  imageBlurHash?: string;
  relatedArticles?: string[];
} 