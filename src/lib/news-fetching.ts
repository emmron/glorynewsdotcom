import { parse } from 'node-html-parser';
import type { Article } from '../types/article';
import { sanitizeHtml, extractReadTime } from './utils';
import type { NewsArticle, NewsSource } from '$lib/types';

const NEWS_SOURCES: NewsSource[] = [
  {
    name: 'Perth Glory Official',
    url: 'https://www.perthglory.com.au',
    updateInterval: 15,
    priority: 'high',
    selectors: {
      list: '.news-list article',
      title: '.article-title',
      content: '.article-content'
    }
  },
  {
    name: 'Keep Up',
    url: 'https://keepup.com.au/perth-glory',
    updateInterval: 15,
    priority: 'medium',
    selectors: {
      list: '.news-grid article',
      title: 'h2',
      content: '.article-body'
    }
  }
];

const RATE_LIMIT = {
  requests: 2,
  interval: 10,
  retryAttempts: 3
};

async function fetchWithTimeout(url: string, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function fetchArticleContent(url: string): Promise<string> {
  try {
    const response = await fetchWithTimeout(url);
    const html = await response.text();
    const root = parse(html);

    // Remove unwanted elements
    root.querySelectorAll('script, style, iframe, .ads, .social-share').forEach(el => el.remove());

    // Get the main content
    const content = root.querySelector('.article-content, .content-main, .article-body')?.innerHTML || '';
    return sanitizeHtml(content);
  } catch (error) {
    console.error(`Error fetching article content from ${url}:`, error);
    return '';
  }
}

async function fetchFromSource(source: NewsSource): Promise<NewsArticle[]> {
  try {
    const response = await fetch(source.url);
    if (!response.ok) {
      throw new Error(`Failed to fetch from ${source.name}`);
    }

    // Process response and extract articles
    // This is a placeholder - actual implementation would use proper HTML parsing
    const articles: NewsArticle[] = [];

    return articles.map(article => ({
      ...article,
      sourceName: source.name,
      sourceUrl: source.url,
      scrapedAt: new Date(),
      isScraped: true
    }));
  } catch (error) {
    console.error(`Error fetching from ${source.name}:`, error);
    return [];
  }
}

export async function fetchNews(): Promise<Article[]> {
  // Placeholder implementation
  return [];
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}