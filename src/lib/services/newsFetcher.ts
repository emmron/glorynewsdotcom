import { Redis } from '@upstash/redis';
import { z } from 'zod';
import type { Article, CacheOptions, ErrorLog, NewsSource } from '../types/news';
import { CACHE_CONFIG } from '../types/news';
import { PerthGlorySource } from '../sources/perthGlory';
import { KeepUpSource } from '../sources/keepUp';
import { fetchWithRetry, InMemoryRateLimiter } from '../utils';
import { fallbackArticles } from './fallbackArticles';

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
  private rateLimiter = new InMemoryRateLimiter(2, 10000); // 2 requests per 10 seconds

  constructor() {
    // Try to initialize Redis, but if it fails, we'll use in-memory cache
    try {
      if (process.env.UPSTASH_REDIS_URL && process.env.UPSTASH_REDIS_TOKEN) {
        this.redis = new Redis({
          url: process.env.UPSTASH_REDIS_URL,
          token: process.env.UPSTASH_REDIS_TOKEN
        });
        console.log('Redis initialized successfully');
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
    // this.sources.set('footballaustralia', new FootballAustraliaSource());
  }

  /**
   * Log an error
   */
  private logError(source: string, type: 'network' | 'parsing' | 'validation', message: string, context: { url?: string, responseCode?: number, payload?: unknown }): void {
    const errorLog: ErrorLog = {
      timestamp: new Date(),
      source,
      errorType: type,
      message,
      context
    };

    console.error(`[${source}] ${type} error: ${message}`, context);
    this.errorLogs.push(errorLog);

    // In a production environment, you might want to store these logs
    // or send them to a logging service
  }

  /**
   * Get an item from cache
   */
  private async cacheGet<T>(key: string): Promise<T | null> {
    try {
      // Try Redis first
      if (this.redis) {
        const value = await this.redis.get(key);
        return value ? JSON.parse(value) : null;
      }

      // Fall back to memory cache
      const timestamp = this.memoryCacheTimestamps.get(key) || 0;
      const now = Date.now();

      if (timestamp && this.memoryCache.has(key)) {
        const cacheAge = now - timestamp;
        const cacheMaxAge = CACHE_CONFIG.news.duration;

        if (cacheAge < cacheMaxAge) {
          return this.memoryCache.get(key);
        }
      }

      return null;
    } catch (error) {
      console.warn('Cache retrieval error:', error);
      return null;
    }
  }

  /**
   * Set an item in cache
   */
  private async cacheSet(key: string, value: any, options: CacheOptions): Promise<void> {
    try {
      const serialized = JSON.stringify(value);

      // Try Redis first
      if (this.redis) {
        await this.redis.set(key, serialized, {
          ex: Math.floor(options.duration / 1000) // Convert ms to seconds
        });
        return;
      }

      // Fall back to memory cache
      this.memoryCache.set(key, value);
      this.memoryCacheTimestamps.set(key, Date.now());
    } catch (error) {
      console.warn('Cache storage error:', error);
    }
  }

  /**
   * Clear the cache
   */
  public async clearCache(): Promise<void> {
    try {
      if (this.redis) {
        // Just clear keys that start with "articles:" or "article:"
        const keys = await this.redis.keys("article*");
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } else {
        // Clear memory cache
        for (const key of this.memoryCache.keys()) {
          if (key.startsWith('article:') || key.startsWith('articles:')) {
            this.memoryCache.delete(key);
            this.memoryCacheTimestamps.delete(key);
          }
        }
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Check if rate limit allows a request
   */
  private async checkRateLimit(source: string): Promise<boolean> {
    try {
      await this.rateLimiter.acquire();
      return true;
    } catch (error) {
      return false;
    } finally {
      this.rateLimiter.release();
    }
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
        console.log(`Returning ${cached.length} cached articles from ${source}`);
        return cached;
      }

      // Fetch from source
      const newsSource = this.sources.get(source);
      if (!newsSource) {
        throw new Error(`Unknown source: ${source}`);
      }

      console.log(`Fetching articles from ${source}...`);
      const articles = await newsSource.fetch();
      console.log(`Fetched ${articles.length} articles from ${source}`);

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

      console.log(`Validated ${validatedArticles.length} articles from ${source}`);

      // Cache results
      await this.cacheSet(cacheKey, validatedArticles, CACHE_CONFIG.news);

      return validatedArticles;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logError(source, 'network', errorMessage, {
        url: `${source}-api-error`
      });
      console.error(`Failed to fetch from ${source}:`, error);
      throw error;
    }
  }

  /**
   * Fetch all articles from all sources
   */
  public async fetchAllSources(): Promise<Record<string, Article[]>> {
    const results: Record<string, Article[]> = {};
    let anySuccessful = false;

    for (const source of this.sources.keys()) {
      try {
        results[source] = await this.fetchArticles(source);
        if (results[source].length > 0) {
          anySuccessful = true;
        }
      } catch (error) {
        console.error(`Error fetching from ${source}:`, error);
        results[source] = [];
      }
    }

    // If no sources succeeded, return fallback articles
    if (!anySuccessful) {
      console.warn('No articles fetched from live sources. Serving default articles.');
      return { fallback: fallbackArticles };
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

    // If no articles, return fallbacks
    if (allArticles.length === 0) {
      return fallbackArticles;
    }

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
      if (cached && cached.length > 0) {
        console.log(`Returning ${cached.length} cached articles from ${source}`);
        return cached;
      }

      // Fetch from source
      const newsSource = this.sources.get(source);
      if (!newsSource) {
        throw new Error(`Unknown source: ${source}`);
      }

      console.log(`Fetching articles from ${source}...`);
      const articles = await newsSource.fetch();
      console.log(`Fetched ${articles.length} articles from ${source}`);

      // Only validate if we got any articles
      if (articles.length === 0) {
        console.warn(`No articles fetched from ${source}, using fallbacks`);
        return fallbackArticles;
      }

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

      console.log(`Validated ${validatedArticles.length} articles from ${source}`);

      // If no articles pass validation, use fallbacks
      if (validatedArticles.length === 0) {
        return fallbackArticles;
      }

      // Cache results
      await this.cacheSet(cacheKey, validatedArticles, CACHE_CONFIG.news);

      return validatedArticles;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logError(source, 'network', errorMessage, {
        url: `${source}-api-error`
      });
      console.error(`Failed to fetch from ${source}:`, error);

      // Return fallback articles if fetching fails
      return fallbackArticles;
    }
  }

  /**
   * Fetch all articles from all sources
   */
  public async fetchAllSources(): Promise<Record<string, Article[]>> {
    const results: Record<string, Article[]> = {};
    let anySuccessful = false;

    for (const source of this.sources.keys()) {
      try {
        results[source] = await this.fetchArticles(source);
        if (results[source].length > 0) {
          anySuccessful = true;
        }
      } catch (error) {
        console.error(`Error fetching from ${source}:`, error);
        results[source] = fallbackArticles;
      }
    }

    // If no sources succeeded, return fallback articles
    if (!anySuccessful) {
      console.warn('No articles fetched from live sources. Serving default articles.');
      return { fallback: fallbackArticles };
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

    // If no articles, return fallbacks
    if (allArticles.length === 0) {
      return fallbackArticles;
    }

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