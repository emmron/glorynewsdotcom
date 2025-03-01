import { Redis } from '@upstash/redis';
import { z } from 'zod';
import type { Article, CacheOptions, ErrorLog, NewsSource } from '../types/news';
import { CACHE_CONFIG } from '../types/news';
import { PerthGlorySource } from '../sources/perthGlory';
import { KeepUpSource } from '../sources/keepUp';

// Create a schema for validating articles
const ArticleSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  publishDate: z.date(),
  sourceUrl: z.string().url(),
  author: z.string().optional(),
  images: z.object({
    featured: z.string().url().optional(),
    gallery: z.array(z.string().url()).optional(),
    thumbnails: z.object({
      small: z.string().url().optional(),
      medium: z.string().url().optional(),
      large: z.string().url().optional(),
    }).optional(),
  }),
  categories: z.array(z.string()),
  tags: z.array(z.string()),
  metadata: z.object({
    wordCount: z.number().int().positive(),
    readingTime: z.number().int().positive(),
    isSponsored: z.boolean(),
    source: z.enum(['official', 'social', 'partner']),
    priority: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    engagement: z.object({
      likes: z.number().int().nonnegative().optional(),
      shares: z.number().int().nonnegative().optional(),
      comments: z.number().int().nonnegative().optional(),
    }).optional(),
  }),
  related: z.object({
    articles: z.array(z.string()),
    tags: z.array(z.string()),
  }).optional(),
});

/**
 * News Fetcher Service
 * Handles fetching news from multiple sources, caching, and error handling
 */
export class NewsFetcher {
  private redis: Redis | null;
  private sources: Map<string, NewsSource>;
  private errorLogs: ErrorLog[] = [];
  private memoryCache: Map<string, any> = new Map();
  private memoryCacheTimestamps: Map<string, number> = new Map();

  constructor() {
    // Try to initialize Redis, but if it fails, we'll use in-memory cache
    try {
      if (process.env.UPSTASH_REDIS_URL && process.env.UPSTASH_REDIS_TOKEN) {
        this.redis = new Redis({
          url: process.env.UPSTASH_REDIS_URL,
          token: process.env.UPSTASH_REDIS_TOKEN
        });
      } else {
        console.warn('Redis credentials missing, using in-memory cache instead');
        this.redis = null;
      }
    } catch (error) {
      console.warn('Failed to initialize Redis, using in-memory cache instead:', error);
      this.redis = null;
    }

    // Register news sources
    this.sources = new Map();
    this.sources.set('perthglory', new PerthGlorySource());
    this.sources.set('keepup', new KeepUpSource());

    // More sources can be added here as they're implemented
    // this.sources.set('footballaustralia', new FootballAustraliaSource());
  }

  /**
   * Clear cache (used by cron jobs)
   */
  public async clearCache(): Promise<void> {
    try {
      if (this.redis) {
        // Get all keys with a pattern
        const keys = await this.redis.keys('articles:*');
        if (keys.length > 0) {
          // Delete each key individually
          for (const key of keys) {
            await this.redis.del(key);
          }
        }
      } else {
        // Clear memory cache
        this.memoryCache.clear();
        this.memoryCacheTimestamps.clear();
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Check if rate limit has been exceeded
   */
  private async checkRateLimit(source: string): Promise<boolean> {
    const key = `ratelimit:${source}`;
    const now = Date.now();
    const windowMs = 10 * 1000; // 10 seconds window
    const maxRequests = 2; // Max 2 requests per window

    if (this.redis) {
      // Get current count
      const count = await this.redis.get<number>(key) || 0;

      if (count >= maxRequests) {
        return false;
      }

      // Increment count
      await this.redis.incr(key);

      // Set expiry
      if (count === 0) {
        await this.redis.expire(key, Math.ceil(windowMs / 1000));
      }
    } else {
      // In-memory rate limiting
      const count = this.memoryCache.get(key) || 0;
      if (count >= maxRequests) {
        return false;
      }

      this.memoryCache.set(key, count + 1);

      // Auto-reset after window
      if (count === 0) {
        setTimeout(() => {
          this.memoryCache.delete(key);
        }, windowMs);
      }
    }

    return true;
  }

  /**
   * Get data from cache
   */
  private async cacheGet<T>(key: string): Promise<T | null> {
    try {
      if (this.redis) {
        const data = await this.redis.get<T>(key);
        return data;
      } else {
        // In-memory cache with expiration check
        const timestamp = this.memoryCacheTimestamps.get(key) || 0;
        const now = Date.now();

        // Check if cache is expired
        if (timestamp > 0 && now - timestamp < CACHE_CONFIG.news.duration) {
          return this.memoryCache.get(key) as T || null;
        }

        return null;
      }
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set data in cache
   */
  private async cacheSet<T>(key: string, data: T, options: CacheOptions): Promise<void> {
    try {
      // Ensure proper serialization of Date objects
      const serializedData = JSON.parse(JSON.stringify(data));

      if (this.redis) {
        await this.redis.set(key, serializedData);
        await this.redis.expire(key, Math.ceil(options.duration / 1000));
      } else {
        // In-memory cache
        this.memoryCache.set(key, serializedData);
        this.memoryCacheTimestamps.set(key, Date.now());

        // Set expiration
        setTimeout(() => {
          this.memoryCache.delete(key);
          this.memoryCacheTimestamps.delete(key);
        }, options.duration);
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Log an error
   */
  private logError(source: string, errorType: ErrorLog['errorType'], message: string, context: ErrorLog['context'] = {}): void {
    const errorLog: ErrorLog = {
      timestamp: new Date(),
      source,
      errorType,
      message,
      context: {
        ...context,
        url: context.url
      }
    };

    this.errorLogs.push(errorLog);
    console.error(`[${source}] ${errorType} error:`, message, context);

    // In a production environment, these logs could be sent to a monitoring service
  }

  /**
   * Fetch articles from a specific source
   */
  public async fetchArticles(source: string): Promise<Article[]> {
    try {
      // Check rate limit
      if (!(await this.checkRateLimit(source))) {
        this.logError(source, 'network', 'Rate limit exceeded', {
          url: `ratelimit:${source}`
        });
        throw new Error(`Rate limit exceeded for source: ${source}`);
      }

      // Check cache
      const cacheKey = `articles:${source}`;
      const cached = await this.cacheGet<Article[]>(cacheKey);
      if (cached && cached.length > 0) {
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
          this.logError(source, 'validation', 'Invalid article', {
            url: article.sourceUrl,
            payload: result.error.format()
          });
          return null;
        }
        return result.data;
      }).filter((article): article is Article => article !== null);

      // Cache results
      await this.cacheSet(cacheKey, validatedArticles, CACHE_CONFIG.news);

      return validatedArticles;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logError(source, 'network', errorMessage, {
        url: `${source}-api-error`
      });
      throw error;
    }
  }

  /**
   * Fetch all articles from all sources
   */
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

  /**
   * Get all articles from all sources, sorted by date
   */
  public async getAllArticles(): Promise<Article[]> {
    const sourceArticles = await this.fetchAllSources();

    // Combine all articles
    const allArticles = Object.values(sourceArticles).flat();

    // Sort by date (newest first)
    return allArticles.sort((a, b) =>
      b.publishDate.getTime() - a.publishDate.getTime()
    );
  }

  /**
   * Get a single article by ID
   */
  public async getArticleById(id: string): Promise<Article | null> {
    // Check cache first
    const cacheKey = `article:${id}`;
    const cached = await this.cacheGet<Article>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch all articles and find the one we need
    const allArticles = await this.getAllArticles();
    const article = allArticles.find(a => a.id === id);

    if (article) {
      // Cache individual article
      await this.cacheSet(cacheKey, article, CACHE_CONFIG.news);
    }

    return article || null;
  }
}