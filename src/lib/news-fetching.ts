import { parse } from 'node-html-parser';
import type { NewsArticle, NewsSource } from '$lib/types';
import { sanitizeContent, extractReadTime, fetchWithTimeout } from './utils';
import { Redis } from '@upstash/redis';
import { z } from 'zod';

// Types from our rules
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
      small: string;
      medium: string;
      large: string;
    };
  };
  categories: string[];
  tags: string[];
  metadata: {
    wordCount: number;
    readingTime: number;
    isSponsored: boolean;
    source: 'official' | 'social' | 'partner';
    priority: 1 | 2 | 3;
    engagement: {
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

// Validation schema using Zod
export const ArticleSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  content: z.string().min(1),
  publishDate: z.date(),
  sourceUrl: z.string().url(),
  author: z.string().optional(),
  images: z.object({
    featured: z.string().url().optional(),
    gallery: z.array(z.string().url()).optional(),
    thumbnails: z.object({
      small: z.string().url(),
      medium: z.string().url(),
      large: z.string().url(),
    }).optional(),
  }),
  categories: z.array(z.string()),
  tags: z.array(z.string()),
  metadata: z.object({
    wordCount: z.number().min(1),
    readingTime: z.number().min(1),
    isSponsored: z.boolean(),
    source: z.enum(['official', 'social', 'partner']),
    priority: z.number().min(1).max(3),
    engagement: z.object({
      likes: z.number().optional(),
      shares: z.number().optional(),
      comments: z.number().optional(),
    }),
  }),
  related: z.object({
    articles: z.array(z.string()),
    tags: z.array(z.string()),
  }).optional(),
});

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  maxRequests: 2,
  windowMs: 10000, // 10 seconds
} as const;

// Cache configuration
const CACHE_CONFIG = {
  news: {
    maxAge: 900, // 15 minutes
    staleWhileRevalidate: 300, // 5 minutes
  },
  static: {
    maxAge: 3600, // 1 hour
    staleWhileRevalidate: 900, // 15 minutes
  },
  images: {
    maxAge: 86400, // 24 hours
    staleWhileRevalidate: 3600, // 1 hour
  },
} as const;

// Source implementations
class PerthGlorySource implements NewsSource {
  async fetch(): Promise<Article[]> {
    try {
      const response = await fetchWithTimeout('https://www.perthglory.com.au/news', { timeout: 5000 });
      const html = await response.text();
      const root = parse(html);
      const articles = root.querySelectorAll('.news-list article').map(article => this.parseArticle(article));
      return articles;
    } catch (error) {
      console.error('Error fetching from Perth Glory source:', error);
      return [];
    }
  }

  private parseArticle(element: any): Article {
    const title = element.querySelector('.article-title').text.trim();
    const content = sanitizeContent(element.querySelector('.article-content').innerHTML);
    const publishDateStr = element.querySelector('.article-date').text.trim();
    const imageUrl = element.querySelector('img')?.getAttribute('src') || '';
    const link = element.querySelector('a')?.getAttribute('href') || '';

    return {
      id: generateSlug(title),
      title,
      content,
      publishDate: new Date(publishDateStr),
      sourceUrl: `https://www.perthglory.com.au${link}`,
      images: {
        featured: imageUrl,
      },
      categories: ['News'],
      tags: ['Perth Glory', 'Official'],
      metadata: {
        wordCount: content.split(/\s+/).length,
        readingTime: extractReadTime(content),
        isSponsored: false,
        source: 'official',
        priority: 1,
        engagement: {}
      }
    };
  }
}

class KeepUpSource implements NewsSource {
  async fetch(): Promise<Article[]> {
    try {
      const response = await fetchWithTimeout('https://keepup.com.au/perth-glory', { timeout: 5000 });
      const html = await response.text();
      const root = parse(html);
      const articles = root.querySelectorAll('.news-grid article').map(article => this.parseArticle(article));
      return articles;
    } catch (error) {
      console.error('Error fetching from KeepUp source:', error);
      return [];
    }
  }

  private parseArticle(element: any): Article {
    const title = element.querySelector('h2').text.trim();
    const content = sanitizeContent(element.querySelector('.article-excerpt')?.innerHTML || '');
    const link = element.querySelector('a')?.getAttribute('href') || '';
    const imageUrl = element.querySelector('img')?.getAttribute('src') || '';

    return {
      id: generateSlug(title),
      title,
      content,
      publishDate: new Date(),
      sourceUrl: `https://keepup.com.au${link}`,
      images: {
        featured: imageUrl,
      },
      categories: ['News'],
      tags: ['Perth Glory', 'A-League'],
      metadata: {
        wordCount: content.split(/\s+/).length,
        readingTime: extractReadTime(content),
        isSponsored: false,
        source: 'partner',
        priority: 2,
        engagement: {}
      }
    };
  }
}

class FootballAustraliaSource implements NewsSource {
  async fetch(): Promise<Article[]> {
    try {
      const response = await fetchWithTimeout('https://www.footballaustralia.com.au/news', { timeout: 5000 });
      const html = await response.text();
      const root = parse(html);
      const articles = root.querySelectorAll('.news-item')
        .filter(item => item.textContent.includes('Perth Glory'))
        .map(article => this.parseArticle(article));
      return articles;
    } catch (error) {
      console.error('Error fetching from Football Australia source:', error);
      return [];
    }
  }

  private parseArticle(element: any): Article {
    const title = element.querySelector('.news-title').text.trim();
    const content = sanitizeContent(element.querySelector('.news-excerpt')?.innerHTML || '');
    const publishDateStr = element.querySelector('.news-date').text.trim();
    const link = element.querySelector('a')?.getAttribute('href') || '';
    const imageUrl = element.querySelector('img')?.getAttribute('src') || '';

    return {
      id: generateSlug(title),
      title,
      content,
      publishDate: new Date(publishDateStr),
      sourceUrl: `https://www.footballaustralia.com.au${link}`,
      images: {
        featured: imageUrl,
      },
      categories: ['News'],
      tags: ['Perth Glory', 'Football Australia'],
      metadata: {
        wordCount: content.split(/\s+/).length,
        readingTime: extractReadTime(content),
        isSponsored: false,
        source: 'official',
        priority: 2,
        engagement: {}
      }
    };
  }
}

// Social media source implementations
class TwitterSource implements NewsSource {
  async fetch(): Promise<Article[]> {
    // Implementation would use Twitter API
    return [];
  }
}

class FacebookSource implements NewsSource {
  async fetch(): Promise<Article[]> {
    // Implementation would use Facebook API
    return [];
  }
}

class InstagramSource implements NewsSource {
  async fetch(): Promise<Article[]> {
    // Implementation would use Instagram API
    return [];
  }
}

class YouTubeSource implements NewsSource {
  async fetch(): Promise<Article[]> {
    // Implementation would use YouTube API
    return [];
  }
}

export class NewsFetcher {
  private redis: Redis;
  private sources: Map<string, NewsSource>;

  constructor(redisUrl: string, redisToken: string) {
    this.redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });
    this.sources = new Map();
    this.initializeSources();
  }

  private initializeSources() {
    // Initialize official sources
    this.sources.set('perthglory', new PerthGlorySource());
    this.sources.set('keepup', new KeepUpSource());
    this.sources.set('footballaus', new FootballAustraliaSource());

    // Initialize social media sources
    this.sources.set('twitter', new TwitterSource());
    this.sources.set('facebook', new FacebookSource());
    this.sources.set('instagram', new InstagramSource());
    this.sources.set('youtube', new YouTubeSource());
  }

  private async checkRateLimit(source: string): Promise<boolean> {
    const key = `rate_limit:${source}:${Date.now()}`;
    const count = await this.redis.incr(key);

    if (count === 1) {
      await this.redis.expire(key, RATE_LIMIT_CONFIG.windowMs / 1000);
    }

    return count <= RATE_LIMIT_CONFIG.maxRequests;
  }

  private async cacheGet<T>(key: string): Promise<T | null> {
    return this.redis.get<T>(key);
  }

  private async cacheSet(key: string, value: any, config: typeof CACHE_CONFIG.news) {
    await this.redis.set(key, value, {
      ex: config.maxAge,
    });
  }

  public async fetchArticles(source: string): Promise<Article[]> {
    try {
      // Check rate limit
      if (!(await this.checkRateLimit(source))) {
        throw new Error(`Rate limit exceeded for source: ${source}`);
      }

      // Check cache
      const cacheKey = `articles:${source}`;
      const cached = await this.cacheGet<Article[]>(cacheKey);
      if (cached) {
        return cached;
      }

      // Fetch from source
      const newsSource = this.sources.get(source);
      if (!newsSource) {
        throw new Error(`Unknown source: ${source}`);
      }

      const articles = await newsSource.fetch();

      // Validate articles
      const validatedArticles = articles.map(article => {
        const result = ArticleSchema.safeParse(article);
        if (!result.success) {
          console.error(`Invalid article from ${source}:`, result.error);
          return null;
        }
        return result.data;
      }).filter((article): article is Article => article !== null);

      // Cache results
      await this.cacheSet(cacheKey, validatedArticles, CACHE_CONFIG.news);

      return validatedArticles;
    } catch (error) {
      console.error(`Error fetching from ${source}:`, error);
      throw error;
    }
  }

  public async fetchAllSources(): Promise<Record<string, Article[]>> {
    const results: Record<string, Article[]> = {};

    for (const source of this.sources.keys()) {
      try {
        results[source] = await this.fetchArticles(source);
      } catch (error) {
        console.error(`Error fetching from ${source}:`, error);
        results[source] = [];
      }
    }

    return results;
  }
}

// Export singleton instance
export const newsFetcher = new NewsFetcher(
  process.env.UPSTASH_REDIS_URL!,
  process.env.UPSTASH_REDIS_TOKEN!
);

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}