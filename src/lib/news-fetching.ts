import { parse } from 'node-html-parser';
import type { Article, NewsArticle, NewsSource } from '$lib/types';
import { sanitizeContent, extractReadTime, fetchWithTimeout } from './utils';

const NEWS_SOURCES: NewsSource[] = [
  {
    name: 'Perth Glory Official',
    url: 'https://www.perthglory.com.au/news',
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
    url: 'https://keepup.com.au/clubs/perth-glory',
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
  interval: 10000, // 10 seconds
  retryAttempts: 3
};

async function fetchArticleContent(url: string): Promise<string> {
  try {
    const response = await fetchWithTimeout(url);
    const html = await response.text();
    const root = parse(html);

    // Remove unwanted elements
    root.querySelectorAll('script, style, iframe, .ads, .social-share').forEach(el => el.remove());

    // Get the main content
    const content = root.querySelector('.article-content, .content-main, .article-body')?.innerHTML || '';
    return sanitizeContent(content);
  } catch (error) {
    console.error(`Error fetching article content from ${url}:`, error);
    return '';
  }
}

async function fetchFromSource(source: NewsSource): Promise<Article[]> {
  try {
    const response = await fetch(source.url);
    if (!response.ok) {
      throw new Error(`Failed to fetch from ${source.name}`);
    }

    const html = await response.text();
    const root = parse(html);
    const articles: Article[] = [];

    const articleElements = root.querySelectorAll(source.selectors.list);
    
    for (const element of articleElements) {
      const titleElement = element.querySelector(source.selectors.title);
      const title = titleElement?.text?.trim() || '';
      const url = titleElement?.getAttribute('href') || '';
      
      if (!title || !url) continue;

      const content = await fetchArticleContent(url);
      const readTime = extractReadTime(content);

      articles.push({
        id: generateSlug(title),
        title,
        content,
        url: new URL(url, source.url).toString(),
        publishDate: new Date(),
        source: source.name,
        imageUrl: element.querySelector('img')?.getAttribute('src') || undefined
      });

      // Respect rate limiting
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT.interval / RATE_LIMIT.requests));
    }

    return articles;
  } catch (error) {
    console.error(`Error fetching from ${source.name}:`, error);
    return [];
  }
}

export async function fetchNews(): Promise<Article[]> {
  const allArticles: Article[] = [];

  for (const source of NEWS_SOURCES) {
    try {
      const articles = await fetchFromSource(source);
      allArticles.push(...articles);
    } catch (error) {
      console.error(`Failed to fetch from ${source.name}:`, error);
    }
  }

  return allArticles;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}