import { parse } from 'node-html-parser';
import type { Article } from '../types/article';
import { sanitizeHtml, extractReadTime } from './utils';

const NEWS_SOURCES = {
  PERTH_GLORY: {
    url: 'https://www.perthglory.com.au/news',
    selector: '.news-article',
    transform: (html: string) => {
      const root = parse(html);
      const articles = root.querySelectorAll('.news-article').map(article => ({
        title: article.querySelector('.article-title')?.text?.trim(),
        link: article.querySelector('a')?.getAttribute('href'),
        image: article.querySelector('img')?.getAttribute('src'),
        date: article.querySelector('.article-date')?.text?.trim(),
        excerpt: article.querySelector('.article-excerpt')?.text?.trim()
      }));
      return articles.filter(a => a.title && a.link);
    }
  },
  KEEPUP: {
    url: 'https://keepup.com.au/clubs/perth-glory',
    selector: '.article-card',
    transform: (html: string) => {
      const root = parse(html);
      const articles = root.querySelectorAll('.article-card').map(article => ({
        title: article.querySelector('h3')?.text?.trim(),
        link: article.querySelector('a')?.getAttribute('href'),
        image: article.querySelector('img')?.getAttribute('src'),
        date: article.querySelector('time')?.getAttribute('datetime'),
        excerpt: article.querySelector('.excerpt')?.text?.trim()
      }));
      return articles.filter(a => a.title && a.link);
    }
  },
  FTBL: {
    url: 'https://www.ftbl.com.au/perth-glory',
    selector: '.article-item',
    transform: (html: string) => {
      const root = parse(html);
      const articles = root.querySelectorAll('.article-item').map(article => ({
        title: article.querySelector('.title')?.text?.trim(),
        link: article.querySelector('a')?.getAttribute('href'),
        image: article.querySelector('img')?.getAttribute('src'),
        date: article.querySelector('.date')?.text?.trim(),
        excerpt: article.querySelector('.excerpt')?.text?.trim()
      }));
      return articles.filter(a => a.title && a.link);
    }
  }
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

export async function fetchNews(): Promise<Article[]> {
  const articles: Article[] = [];
  const errors: string[] = [];

  await Promise.all(
    Object.entries(NEWS_SOURCES).map(async ([sourceName, source]) => {
      try {
        const response = await fetchWithTimeout(source.url);
        const html = await response.text();
        const items = source.transform(html);

        for (const item of items) {
          if (!item.link) continue;

          const fullUrl = item.link.startsWith('http') ? item.link : `${new URL(source.url).origin}${item.link}`;
          const content = await fetchArticleContent(fullUrl);
          
          if (!content) continue;

          const article: Article = {
            title: item.title || 'Untitled',
            slug: item.link.split('/').pop()?.replace(/[^a-z0-9]+/g, '-') || '',
            content,
            excerpt: item.excerpt || content.substring(0, 160) + '...',
            publishDate: new Date(item.date || Date.now()),
            featuredImage: item.image || '',
            sourceName,
            sourceUrl: fullUrl,
            scrapedAt: new Date(),
            isScraped: true,
            status: 'published',
            readTime: extractReadTime(content),
            categories: ['News'],
            tags: ['Perth Glory', 'A-League']
          };

          articles.push(article);
        }
      } catch (error) {
        errors.push(`Failed to fetch from ${sourceName}: ${error.message}`);
      }
    })
  );

  if (errors.length > 0) {
    console.error('News fetching errors:', errors);
  }

  // Sort by date, newest first
  return articles.sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime());
} 