import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { NewsFetcher } from '$lib/services/newsFetcher';
import type { Article } from '$lib/types/news';
import { sanitizeContent, extractReadTime, slugify } from '$lib/utils';
import { DATA_SOURCES } from '$lib/config';

/**
 * Transforms an article for API response
 * Ensures consistent format and sanitizes content
 */
function transformArticleForResponse(article: Article) {
  const publishDate = article.publishDate instanceof Date
    ? article.publishDate
    : new Date(article.publishDate);

  const plainText = article.content.replace(/<[^>]+>/g, '');
  const summary = plainText.length > 200
    ? plainText.substring(0, 200) + '...'
    : plainText;
  const sanitizedContent = sanitizeContent(article.content);

  // Fields from the original Article type that are directly used or have fallbacks
  const id = article.id;
  const title = article.title;
  const featuredImage = article.images?.featured || '/images/news/default-news.jpg';
  const category = article.categories?.[0] || 'News';
  const author = article.author || 'PGN Team';
  const sourceUrl = article.sourceUrl || '#';
  const sourceName = (article as any).sourceName || article.metadata?.source || 'Perth Glory News';
  const tags = article.tags || [];

  // Generated fields
  const slug = slugify(title) || id;
  const readTime = extractReadTime(sanitizedContent);

  return {
    id: id,
    title: title,
    content: sanitizedContent,
    summary: summary,
    date: publishDate.toISOString(),
    imageUrl: featuredImage,
    category: category,
    slug: slug,
    excerpt: summary,
    publishDate: publishDate.toISOString(),
    featuredImage: featuredImage,
    sourceName: sourceName,
    author: author,
    readTime: readTime,
    tags: tags,
    source: sourceName,
    sourceUrl: sourceUrl,
    // isScraped & scrapedAt are not part of the base Article type from Zod, handle if available or omit
    isScraped: (article as any).isScraped || false, // Use type assertion if these are added dynamically
    scrapedAt: (article as any).scrapedAt ? new Date((article as any).scrapedAt).toISOString() : null,
  };
}

// Helper function to provide default articles in the frontend-expected format
const getDefaultFrontendArticles = () => [
  {
    id: 'default-1',
    title: 'Welcome to Perth Glory News!',
    content: '<p>Stay tuned for the latest updates on Perth Glory FC. Live news is temporarily unavailable.</p>',
    summary: 'Stay tuned for the latest updates on Perth Glory FC. Live news is temporarily unavailable.',
    date: new Date().toISOString(),
    imageUrl: '/images/teams/perthglory_logo_crest_faded.png',
    category: 'Club News',
    slug: 'welcome-perth-glory-news',
    excerpt: 'Stay tuned for the latest updates on Perth Glory FC. Live news is temporarily unavailable.',
    publishDate: new Date().toISOString(),
    featuredImage: '/images/teams/perthglory_logo_crest_faded.png',
    sourceName: 'Perth Glory News',
    author: 'PGN Team',
    readTime: 1,
    tags: ['Welcome', 'Placeholder'],
    source: 'Perth Glory News',
    sourceUrl: '#',
    isScraped: false,
    scrapedAt: null,
  },
  {
    id: 'default-2',
    title: 'Upcoming Match Preview (Placeholder)',
    content: '<p>Details about the upcoming match will be available when live news services are restored. Check back soon!</p>',
    summary: 'Details about the upcoming match will be available when live news services are restored.',
    date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    imageUrl: '/images/news/generic_football_match.jpg',
    category: 'Matches',
    slug: 'upcoming-match-preview-placeholder',
    excerpt: 'Details about the upcoming match will be available when live news services are restored.',
    publishDate: new Date(Date.now() - 86400000).toISOString(),
    featuredImage: '/images/news/generic_football_match.jpg',
    sourceName: 'Perth Glory News',
    author: 'PGN Team',
    readTime: 2,
    tags: ['Preview', 'Placeholder'],
    source: 'Perth Glory News',
    sourceUrl: '#',
    isScraped: false,
    scrapedAt: null,
  }
];

export const GET: RequestHandler = async ({ url }) => {
  try {
    const newsFetcher = new NewsFetcher();
    const sourceParam = url.searchParams.get('source');
    const categoryFilter = url.searchParams.get('category');
    const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : 30;

    let fetchedArticles: Article[] = [];

    if (sourceParam) {
      fetchedArticles = await newsFetcher.fetchArticles(sourceParam);
      if (fetchedArticles.length > limit) fetchedArticles = fetchedArticles.slice(0, limit);
    } else {
      const primarySources = DATA_SOURCES.primary;
      const articlesPromises = primarySources.map(src =>
        newsFetcher.fetchArticles(src)
      );

      const results = await Promise.allSettled(articlesPromises);

      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          fetchedArticles.push(...result.value);
        } else if (result.status === 'rejected') {
          console.warn(`Failed to fetch from a source: ${result.reason}`);
        }
      });

      if (categoryFilter) {
        fetchedArticles = fetchedArticles.filter(article =>
          article.categories.some(cat =>
            cat.toLowerCase() === categoryFilter.toLowerCase()
          )
        );
      }

      fetchedArticles = fetchedArticles
        .sort((a, b) => {
          const dateA = a.publishDate instanceof Date ? a.publishDate : new Date(a.publishDate);
          const dateB = b.publishDate instanceof Date ? b.publishDate : new Date(b.publishDate);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, limit);
    }

    if (fetchedArticles.length === 0 && !sourceParam) {
      console.warn('No articles fetched from live sources. Serving default articles.');
      const defaultArticles = getDefaultFrontendArticles();
      return json({
        success: true,
        articles: defaultArticles,
        count: defaultArticles.length,
        sources: ['default'],
        timestamp: new Date().toISOString(),
        message: 'Currently displaying placeholder content as no live articles were found. Please check back later.'
      }, { headers: { 'Cache-Control': 'no-cache' } });
    }

    const transformedArticles = fetchedArticles.map(transformArticleForResponse);

    return json({
      success: true,
      articles: transformedArticles,
      count: transformedArticles.length,
      sources: sourceParam ? [sourceParam] : DATA_SOURCES.primary,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'public, max-age=900' // 15 minutes cache
      }
    });
  } catch (error) {
    console.error('Error in GET /api/news:', error);
    const defaultArticles = getDefaultFrontendArticles();
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return json({
      success: true,
      articles: defaultArticles,
      count: defaultArticles.length,
      sources: ['default_error'],
      timestamp: new Date().toISOString(),
      message: `Failed to load live news (${errorMessage}). Displaying placeholder content.`
    }, {
      headers: { 'Cache-Control': 'no-cache' },
      status: 200
    });
  }
};