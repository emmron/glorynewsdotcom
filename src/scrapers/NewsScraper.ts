import { JSDOM } from 'jsdom';
import { RateLimit } from 'async-sema';
import { NewsSource } from '../types/scraper';
import { Article } from '../types/article';
import { SCRAPER_CONFIG } from './config';

export class NewsScraper {
  private rateLimiter: RateLimit;

  constructor() {
    this.rateLimiter = new RateLimit(
      SCRAPER_CONFIG.rateLimit.requests,
      { timeUnit: SCRAPER_CONFIG.rateLimit.perSeconds * 1000 }
    );
  }

  async scrapeSource(source: NewsSource): Promise<Article[]> {
    try {
      await this.rateLimiter.acquire();
      const url = `${source.baseUrl}${source.newsPath}`;
      const response = await fetch(url);
      const html = await response.text();
      const dom = new JSDOM(html);
      const document = dom.window.document;

      const articles = Array.from(document.querySelectorAll(source.selectors.articleList))
        .map(article => this.parseArticle(article as Element, source));

      return articles;
    } catch (error) {
      console.error(`Error scraping ${source.name}:`, error);
      return [];
    } finally {
      this.rateLimiter.release();
    }
  }

  private parseArticle(articleElement: Element, source: NewsSource): Article {
    const title = articleElement.querySelector(source.selectors.title)?.textContent?.trim() || '';
    const content = articleElement.querySelector(source.selectors.content)?.textContent?.trim() || '';
    const dateStr = articleElement.querySelector(source.selectors.date)?.textContent?.trim() || '';
    const imageUrl = articleElement.querySelector(source.selectors.image)?.getAttribute('src') || '';

    return {
      title,
      slug: this.generateSlug(title),
      content,
      excerpt: content.substring(0, 160) + '...',
      publishDate: new Date(dateStr),
      featuredImage: imageUrl.startsWith('http') ? imageUrl : `${source.baseUrl}${imageUrl}`,
      sourceName: source.name,
      sourceUrl: source.baseUrl,
      scrapedAt: new Date(),
      isScraped: true,
      status: 'published',
    };
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  async scrapeAll(): Promise<Article[]> {
    const allArticles: Article[] = [];
    
    for (const source of Object.values(SCRAPER_CONFIG.sources)) {
      const articles = await this.scrapeSource(source);
      allArticles.push(...articles);
    }

    return allArticles;
  }
} 