import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { NewsFetcher } from '$lib/services/newsFetcher';
import type { Article } from '$lib/types/news';
import { sanitizeContent, extractReadTime } from '$lib/utils';
import { DATA_SOURCES } from '$lib/config';

/**
 * Transforms an article for API response
 * Ensures consistent format and sanitizes content
 */
function transformArticleForResponse(article: Article) {
  // Make sure we handle dates properly
  const publishDate = article.publishDate instanceof Date
    ? article.publishDate
    : new Date(article.publishDate);

  // Extract clean text for summary/excerpt
  const plainText = article.content.replace(/<[^>]+>/g, '');
  const summary = plainText.length > 200
    ? plainText.substring(0, 200) + '...'
    : plainText;

  // Sanitize content for security
  const sanitizedContent = sanitizeContent(article.content);

  return {
    id: article.id,
    title: article.title,
    content: sanitizedContent,
    summary: summary,
    date: publishDate.toISOString(),
    imageUrl: article.images.featured || '/images/default-news.jpg',
    category: article.categories[0] || 'News',

    // Add these fields to match what the frontend expects
    slug: article.slug || article.id,
    excerpt: summary,
    publishDate: publishDate.toISOString(),
    featuredImage: article.images.featured || '/images/default-news.jpg',
    sourceName: article.sourceName || 'Perth Glory',
    author: article.author || 'Perth Glory',
    readTime: article.readTime || extractReadTime(sanitizedContent),

    // Source information
    source: article.sourceName || 'Perth Glory',
    sourceUrl: article.sourceUrl || '',
    isScraped: article.isScraped || false,
    scrapedAt: article.scrapedAt ? new Date(article.scrapedAt).toISOString() : null
  };
}

export const GET: RequestHandler = async ({ url }) => {
  try {
    const newsFetcher = new NewsFetcher();
    const source = url.searchParams.get('source');
    const category = url.searchParams.get('category');
    const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : 30;

    // Get articles from multiple sources
    let articles: Article[] = [];

    if (source) {
      // Fetch from specific source if requested
      articles = await newsFetcher.getArticlesBySource(source, limit);
    } else {
      // Otherwise fetch from all configured sources
      const primarySources = DATA_SOURCES.primary;
      const socialSources = DATA_SOURCES.social;

      // Fetch from primary news sources
      const primaryArticles = await Promise.all(
        primarySources.map(source => newsFetcher.getArticlesBySource(source, Math.ceil(limit / primarySources.length)))
      );

      // Fetch from social media sources
      const socialArticles = await Promise.all(
        socialSources.map(source => newsFetcher.getArticlesBySource(source, Math.ceil(limit / 4)))
      );

      // Combine all articles
      articles = [
        ...primaryArticles.flat(),
        ...socialArticles.flat()
      ];

      // Filter by category if specified
      if (category) {
        articles = articles.filter(article =>
          article.categories.some(cat =>
            cat.toLowerCase() === category.toLowerCase()
          )
        );
      }

      // Sort by date (newest first) and limit
      articles = articles
        .sort((a, b) => {
          const dateA = a.publishDate instanceof Date ? a.publishDate : new Date(a.publishDate);
          const dateB = b.publishDate instanceof Date ? b.publishDate : new Date(b.publishDate);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, limit);
    }

    // Transform for response
    const transformedArticles = articles.map(transformArticleForResponse);

    return json({
      success: true,
      articles: transformedArticles,
      count: transformedArticles.length,
      sources: source ? [source] : [...DATA_SOURCES.primary, ...DATA_SOURCES.social],
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'public, max-age=900' // 15 minutes cache
      }
    });
  } catch (error) {
    console.error('Error fetching news:', error);

    return json({
      success: false,
      error: 'Failed to fetch news',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
};