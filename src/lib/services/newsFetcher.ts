import { Redis } from '@upstash/redis';
import { z } from 'zod';
import type { Article, CacheOptions, ErrorLog, NewsSource } from '../types/news';
import { CACHE_CONFIG } from '../types/news';
import { PerthGlorySource } from '../sources/perthGlory';
import { KeepUpSource } from '../sources/keepUp';
import { fetchWithRetry } from '../utils/fetchUtils';
import { RateLimiter } from '../utils/rateLimiter';
import { fallbackArticles } from './fallbackData';

/**
 * Schema for validating article structure
 * Ensures all articles meet our data requirements before processing
 */
const ArticleValidator = z.object({
  id: z.string().min(1, "Article ID cannot be empty"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  publishDate: z.date(),
  sourceUrl: z.string().url("Source URL must be a valid URL"),
  author: z.string().optional(),
  images: z.object({
    featured: z.string().url("Featured image must be a valid URL").optional(),
    gallery: z.array(z.string().url("Gallery images must be valid URLs")).optional(),
    thumbnails: z.object({
      small: z.string().url("Small thumbnail must be a valid URL").optional(),
      medium: z.string().url("Medium thumbnail must be a valid URL").optional(),
      large: z.string().url("Large thumbnail must be a valid URL").optional(),
    }).optional(),
  }),
  categories: z.array(z.string()),
  tags: z.array(z.string()),
  metadata: z.object({
    wordCount: z.number().int().positive("Word count must be positive"),
    readingTime: z.number().int().positive("Reading time must be positive"),
    isSponsored: z.boolean(),
    source: z.enum(['official', 'social', 'partner']),
    priority: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    engagement: z.object({
      likes: z.number().int().nonnegative("Likes must be non-negative").optional(),
      shares: z.number().int().nonnegative("Shares must be non-negative").optional(),
      comments: z.number().int().nonnegative("Comments must be non-negative").optional(),
    }).optional(),
  }),
  related: z.object({
    articles: z.array(z.string()),
    tags: z.array(z.string()),
  }).optional(),
});

/**
 * Perth Glory News Fetcher Service
 *
 * Responsible for fetching, validating, and caching news articles from multiple sources.
 * Implements fallback mechanisms, error logging, and rate limiting to ensure reliable
 * content delivery even when external sources are unavailable.
 */
export class NewsFetcher {
  private redis: Redis | null;
  private sources: Map<string, NewsSource>;
  private errorLogs: ErrorLog[] = [];
  private memoryCache: Map<string, any> = new Map();
  private memoryCacheTimestamps: Map<string, number> = new Map();
  private rateLimiter: RateLimiter;

  /**
   * Initialize the news fetcher with caching and sources
   */
  constructor() {
    // Initialize rate limiter - 3 requests per 15 seconds
    this.rateLimiter = new RateLimiter({
      maxRequests: 3,
      timeWindow: 15000,
      retryAfter: 5000
    });

    // Initialize Redis for distributed caching
    this.initializeRedis();

    // Register all available news sources
    this.registerSources();
  }

  /**
   * Set up Redis connection with fallback to memory cache
   */
  private initializeRedis(): void {
    try {
      if (process.env.UPSTASH_REDIS_URL && process.env.UPSTASH_REDIS_TOKEN) {
        this.redis = new Redis({
          url: process.env.UPSTASH_REDIS_URL,
          token: process.env.UPSTASH_REDIS_TOKEN
        });
        console.log('✅ Redis cache initialized successfully');
      } else {
        console.warn('⚠️ Redis credentials missing, using in-memory cache');
        this.redis = null;
      }
    } catch (error) {
      console.warn('⚠️ Failed to initialize Redis, falling back to in-memory cache:', error);
      this.redis = null;
    }
  }

  /**
   * Register all available news sources
   */
  private registerSources(): void {
    this.sources = new Map();

    // Official Perth Glory website
    this.sources.set('perthglory', new PerthGlorySource());

    // KeepUp A-League coverage
    this.sources.set('keepup', new KeepUpSource());

    // Additional sources can be added here
    // this.sources.set('footballaustralia', new FootballAustraliaSource());
    // this.sources.set('socialmedia', new SocialMediaAggregator());

    console.log(`📰 Registered ${this.sources.size} news sources`);
  }

  /**
   * Record an error with detailed context for monitoring
   */
  private logError(source: string, type: 'network' | 'parsing' | 'validation', message: string, context: { url?: string, responseCode?: number, payload?: unknown }): void {
    const errorLog: ErrorLog = {
      timestamp: new Date(),
      source,
      errorType: type,
      message,
      context
    };

    console.error(`❌ [${source}] ${type} error: ${message}`, context);
    this.errorLogs.push(errorLog);

    // In production, we would send these logs to a monitoring service
    // this.monitoringService.reportError(errorLog);
  }

  /**
   * Retrieve an item from cache with type safety
   */
  private async cacheGet<T>(key: string): Promise<T | null> {
    try {
      // Try Redis first for distributed caching
      if (this.redis) {
        const value = await this.redis.get(key);
        if (value) {
          return JSON.parse(value) as T;
        }
        return null;
      }

      // Fall back to memory cache with TTL check
      const timestamp = this.memoryCacheTimestamps.get(key) || 0;
      const now = Date.now();

      if (timestamp && this.memoryCache.has(key)) {
        const cacheAge = now - timestamp;
        const cacheMaxAge = CACHE_CONFIG.news.duration;

        if (cacheAge < cacheMaxAge) {
          return this.memoryCache.get(key) as T;
        }
      }

      return null;
    } catch (error) {
      console.warn('⚠️ Cache retrieval error:', error);
      return null;
    }
  }

  /**
   * Store an item in cache with TTL
   */
  private async cacheSet(key: string, value: any, options: CacheOptions): Promise<void> {
    try {
      const serialized = JSON.stringify(value);

      // Try Redis first for distributed caching
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
      console.warn('⚠️ Cache storage error:', error);
    }
  }

  /**
   * Clear all article caches
   */
  public async clearCache(): Promise<void> {
    try {
      if (this.redis) {
        // Clear only article-related keys
        const keys = await this.redis.keys("article*");
        if (keys.length > 0) {
          await this.redis.del(...keys);
          console.log(`🧹 Cleared ${keys.length} keys from Redis cache`);
        }
      } else {
        // Clear memory cache
        let clearedCount = 0;
        for (const key of this.memoryCache.keys()) {
          if (key.startsWith('article:') || key.startsWith('articles:')) {
            this.memoryCache.delete(key);
            this.memoryCacheTimestamps.delete(key);
            clearedCount++;
          }
        }
        console.log(`🧹 Cleared ${clearedCount} keys from memory cache`);
      }
    } catch (error) {
      console.error('❌ Error clearing cache:', error);
    }
  }

  /**
   * Fetch articles from a specific source with caching and validation
   */
  public async fetchArticles(source: string): Promise<Article[]> {
    try {
      // Apply rate limiting to prevent API abuse
      const canProceed = await this.rateLimiter.acquire(source);
      if (!canProceed) {
        this.logError(source, 'network', 'Rate limit exceeded', {
          url: `ratelimit:${source}`
        });
        console.warn(`⚠️ Rate limit exceeded for ${source}, using fallbacks`);
        return fallbackArticles;
      }

      // Check cache before making external requests
      const cacheKey = `articles:${source}`;
      const cached = await this.cacheGet<Article[]>(cacheKey);
      if (cached && cached.length > 0) {
        console.log(`📋 Returning ${cached.length} cached articles from ${source}`);
        return cached;
      }

      // Get the appropriate news source handler
      const newsSource = this.sources.get(source);
      if (!newsSource) {
        console.error(`❌ Unknown source: ${source}`);
        return fallbackArticles;
      }

      // Fetch fresh articles from the source
      console.log(`🔄 Fetching articles from ${source}...`);
      const articles = await fetchWithRetry(() => newsSource.fetch(), {
        retries: 3,
        initialDelay: 1000,
        maxDelay: 5000
      });

      console.log(`📥 Fetched ${articles.length} articles from ${source}`);

      // Return fallbacks if no articles were found
      if (articles.length === 0) {
        console.warn(`⚠️ No articles fetched from ${source}, using fallbacks`);
        return fallbackArticles;
      }

      // Validate each article against our schema
      const validatedArticles = articles.map(article => {
        const result = ArticleValidator.safeParse(article);
        if (!result.success) {
          this.logError(source, 'validation', 'Invalid article structure', {
            url: article.sourceUrl,
            payload: result.error.format()
          });
          return null;
        }
        return result.data;
      }).filter((article): article is Article => article !== null);

      console.log(`✅ Validated ${validatedArticles.length}/${articles.length} articles from ${source}`);

      // Use fallbacks if validation removed all articles
      if (validatedArticles.length === 0) {
        console.warn(`⚠️ No valid articles from ${source}, using fallbacks`);
        return fallbackArticles;
      }

      // Cache the validated articles
      await this.cacheSet(cacheKey, validatedArticles, CACHE_CONFIG.news);

      return validatedArticles;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logError(source, 'network', errorMessage, {
        url: `${source}-api-error`
      });
      console.error(`❌ Failed to fetch from ${source}:`, error);

      // Return fallback articles to ensure content availability
      return fallbackArticles;
    } finally {
      // Always release the rate limiter
      this.rateLimiter.release(source);
    }
  }

  /**
   * Fetch articles from all configured sources
   */
  public async fetchAllSources(): Promise<Record<string, Article[]>> {
    const results: Record<string, Article[]> = {};
    let successfulSources = 0;

    // Process each source concurrently
    const fetchPromises = Array.from(this.sources.keys()).map(async (source) => {
      try {
        const articles = await this.fetchArticles(source);
        results[source] = articles;

        if (articles.length > 0 && !articles.every(a => fallbackArticles.some(f => f.id === a.id))) {
          successfulSources++;
        }
      } catch (error) {
        console.error(`❌ Error fetching from ${source}:`, error);
        results[source] = fallbackArticles;
      }
    });

    // Wait for all sources to complete
    await Promise.all(fetchPromises);

    // If no sources succeeded, add fallback source
    if (successfulSources === 0) {
      console.warn('⚠️ No articles fetched from any live sources. Serving fallback content.');
      results['fallback'] = fallbackArticles;
    }

    return results;
  }

  /**
   * Get all articles from all sources, sorted by date
   */
  public async getAllArticles(): Promise<Article[]> {
    const sourceArticles = await this.fetchAllSources();

    // Combine all articles from all sources
    const allArticles = Object.values(sourceArticles).flat();

    // Deduplicate articles by ID
    const uniqueArticles = Array.from(
      new Map(allArticles.map(article => [article.id, article])).values()
    );

    // If no articles were found, return fallbacks
    if (uniqueArticles.length === 0) {
      return fallbackArticles;
    }

    // Sort by date (newest first) and apply priority boost
    return uniqueArticles.sort((a, b) => {
      // First sort by priority (lower number = higher priority)
      const priorityDiff = a.metadata.priority - b.metadata.priority;
      if (priorityDiff !== 0) return priorityDiff;

      // Then sort by date
      return b.publishDate.getTime() - a.publishDate.getTime();
    });
  }

  /**
   * Get a single article by ID with caching
   */
  /**
   * Retrieves a single article by its unique identifier
   *
   * @param id - The unique identifier of the article to retrieve
   * @returns The article if found, null otherwise
   * @throws Error if the id parameter is invalid
   */
  public async getArticleById(id: string): Promise<Article | null> {
    // Check cache first for this specific article
    const cacheKey = `article:${id}`;
    const cached = await this.cacheGet<Article>(cacheKey);
    if (cached) {
      console.log(`📋 Returning cached article: ${cached.title}`);
      return cached;
    }

    // Fetch all articles and find the one we need
    const allArticles = await this.getAllArticles();
    const article = allArticles.find(a => a.id === id);

    if (article) {
      // Cache individual article for faster future access
      await this.cacheSet(cacheKey, article, CACHE_CONFIG.news);
      console.log(`📥 Found and cached article: ${article.title}`);
    } else {
      console.warn(`⚠️ Article not found: ${id}`);
    }

    return article || null;
  }
}