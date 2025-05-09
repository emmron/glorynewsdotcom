import { JSDOM } from 'jsdom';
import { RateLimit } from 'async-sema';
import type { NewsSource } from '../types/scraper';
import type { Article } from '../types/article';
import { SCRAPER_CONFIG } from './config';

export class NewsScraper {
  private rateLimiter: RateLimit;

  constructor() {
    this.rateLimiter = new RateLimit({
      concurrency: SCRAPER_CONFIG.rateLimit.requests,
      interval: SCRAPER_CONFIG.rateLimit.perSeconds * 1000
    });
  }

  async scrapeSource(source: NewsSource): Promise<Article[]> {
    try {
      // Acquire a rate limit token
      await this.rateLimiter.acquire();
      const url = `${source.baseUrl}${source.newsPath}`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': SCRAPER_CONFIG.userAgent || 'Perth Glory News Scraper',
        },
        signal: AbortSignal.timeout(SCRAPER_CONFIG.timeout || 10000)
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
      }

      const html = await response.text();
      const dom = new JSDOM(html);
      const document = dom.window.document;

      const articleElements = document.querySelectorAll(source.selectors.articleList);
      if (articleElements.length === 0) {
        console.warn(`No articles found for ${source.name} using selector: ${source.selectors.articleList}`);
      }

      const articles = Array.from(articleElements)
        .map(article => this.parseArticle(article as Element, source))
        .filter(article => article !== null) // Filter out null articles
        .map(article => ({
          ...article as Article,
          club: source.club || 'perth-glory' // Add club information
        }));

      return articles;
    } catch (error) {
      console.error(`Error scraping ${source.name}:`, error);
      return [];
    } finally {
      this.rateLimiter.release();
    }
  }

  private parseArticle(articleElement: Element, source: NewsSource): Article | null {
    try {
      const title = articleElement.querySelector(source.selectors.title)?.textContent?.trim() || '';
      const content = articleElement.querySelector(source.selectors.content)?.textContent?.trim() || '';

      // Skip articles with missing essential data
      if (!title || !content) {
        return null;
      }

      const dateStr = articleElement.querySelector(source.selectors.date)?.textContent?.trim() || '';
      const imageElement = articleElement.querySelector(source.selectors.image);
      const imageUrl = imageElement?.getAttribute('src') || imageElement?.getAttribute('data-src') || '';

      // Handle relative URLs for images
      const fullImageUrl = imageUrl.startsWith('http')
        ? imageUrl
        : imageUrl.startsWith('/')
          ? `${source.baseUrl}${imageUrl}`
          : `${source.baseUrl}/${imageUrl}`;

      // Parse date with fallback to current date
      let publishDate: Date;
      try {
        publishDate = dateStr ? new Date(dateStr) : new Date();
        // Check if date is valid
        if (isNaN(publishDate.getTime())) {
          publishDate = new Date();
        }
      } catch (e) {
        publishDate = new Date();
      }

      // Create excerpt with proper length and without cutting words
      const excerptLength = 160;
      let excerpt = content.substring(0, excerptLength);
      if (content.length > excerptLength) {
        // Find the last space to avoid cutting words
        const lastSpace = excerpt.lastIndexOf(' ');
        if (lastSpace > 0) {
          excerpt = excerpt.substring(0, lastSpace);
        }
        excerpt += '...';
      }

      // Get article URL if available
      const articleUrl = articleElement.querySelector('a')?.href || '';
      const fullArticleUrl = articleUrl.startsWith('http')
        ? articleUrl
        : articleUrl.startsWith('/')
          ? `${source.baseUrl}${articleUrl}`
          : `${source.baseUrl}/${articleUrl}`;

      // Generate a unique ID for the article
      const id = `${source.id}-${this.generateSlug(title)}-${Date.now()}`;

      return {
        id,
        title,
        slug: this.generateSlug(title),
        content,
        excerpt,
        publishDate,
        featuredImage: fullImageUrl,
        sourceName: source.name,
        sourceUrl: fullArticleUrl || source.baseUrl,
        scrapedAt: new Date(),
        isScraped: true,
        author: articleElement.querySelector(source.selectors.author)?.textContent?.trim() || 'Perth Glory News',
        category: source.category || 'news',
        tags: this.extractTags(articleElement, source),
        club: source.club || 'perth-glory'
      };
    } catch (error) {
      console.error(`Error parsing article from ${source.name}:`, error);
      return null;
    }
  }

  private extractTags(articleElement: Element, source: NewsSource): string[] {
    try {
      if (!source.selectors.tags) return [];

      const tagElements = articleElement.querySelectorAll(source.selectors.tags);
      return Array.from(tagElements)
        .map(tag => tag.textContent?.trim())
        .filter(tag => tag && tag.length > 0) as string[];
    } catch (error) {
      console.error(`Error extracting tags from ${source.name}:`, error);
      return [];
    }
  }

  private generateSlug(title: string): string {
    if (!title) return `article-${Date.now()}`;

    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 100); // Limit slug length
  }

  async scrapeAll(): Promise<Article[]> {
    const allArticles: Article[] = [];
    const errors: string[] = [];

    const sources = Object.values(SCRAPER_CONFIG.sources);

    // Process sources in parallel with concurrency limit
    const concurrencyLimit = SCRAPER_CONFIG.concurrencyLimit || 2;
    for (let i = 0; i < sources.length; i += concurrencyLimit) {
      const batch = sources.slice(i, i + concurrencyLimit);
      const results = await Promise.allSettled(
        batch.map(source => this.scrapeSource(source))
      );

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allArticles.push(...result.value);
        } else {
          errors.push(`Failed to scrape ${batch[index].name}: ${result.reason}`);
        }
      });
    }

    if (errors.length > 0) {
      console.error('Scraping errors:', errors);
    }

    // Sort articles by publish date (newest first)
    return allArticles.sort((a, b) =>
      new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );
  }
}