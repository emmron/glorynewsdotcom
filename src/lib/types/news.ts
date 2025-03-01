export interface Article {
  id: string;
  title: string;
  content: string;
  publishDate: Date;
  sourceUrl: string;
  author?: string;
  images: {
    featured?: string;
    gallery?: string[];
    thumbnails?: {
      small?: string;
      medium?: string;
      large?: string;
    }
  };
  categories: string[];
  tags: string[];
  metadata: {
    wordCount: number;
    readingTime: number;
    isSponsored: boolean;
    source: 'official' | 'social' | 'partner';
    priority: 1 | 2 | 3;
    engagement?: {
      likes?: number;
      shares?: number;
      comments?: number;
    };
  };
  related?: {
    articles: string[];
    tags: string[];
  };
}

export interface NewsSource {
  fetch(): Promise<Article[]>;
}

export interface ErrorLog {
  timestamp: Date;
  source: string;
  errorType: 'network' | 'parsing' | 'validation';
  message: string;
  stackTrace?: string;
  context: {
    url?: string;
    responseCode?: number;
    payload?: unknown;
  };
}

export interface RateLimiter {
  acquire(): Promise<void>;
  release(): void;
}

export interface CacheOptions {
  duration: number; // in milliseconds
  staleWhileRevalidate?: boolean;
}

export const CACHE_CONFIG = {
  news: {
    duration: 15 * 60 * 1000, // 15 minutes
    staleWhileRevalidate: true
  },
  images: {
    duration: 24 * 60 * 60 * 1000, // 24 hours
    staleWhileRevalidate: true
  }
};
