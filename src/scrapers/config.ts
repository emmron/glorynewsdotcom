import { ScraperConfig } from '../types/scraper';

export const SCRAPER_CONFIG: ScraperConfig = {
  sources: {
    perthGlory: {
      name: 'Perth Glory Official',
      baseUrl: 'https://www.perthglory.com.au',
      newsPath: '/news',
      selectors: {
        articleList: '.news-list article',
        title: '.article-title',
        content: '.article-content',
        date: '.article-date',
        image: '.article-image img',
      },
      updateInterval: 15 * 60 * 1000, // 15 minutes
    },
    keepUp: {
      name: 'Keep Up',
      baseUrl: 'https://keepup.com.au',
      newsPath: '/perth-glory',
      selectors: {
        articleList: '.news-grid article',
        title: 'h2',
        content: '.article-body',
        date: 'time',
        image: '.featured-image img',
      },
      updateInterval: 15 * 60 * 1000,
    },
    // Add more sources as needed
  },
  rateLimit: {
    requests: 2,
    perSeconds: 10,
  },
  cacheExpiry: 60 * 60 * 1000, // 1 hour
  retryAttempts: 3,
} 