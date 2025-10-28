import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
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
  const requestedPage = parseInt(url.searchParams.get('page') || '1', 10);
  const requestedLimit = parseInt(url.searchParams.get('limit') || '10', 10);
  const category = url.searchParams.get('category');

  try {
    const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const limit = Number.isFinite(requestedLimit) && requestedLimit > 0 ? requestedLimit : 10;

    console.log(`Fetching news (page ${page}, limit ${limit}, category ${category || 'all'})`);
    const newsFetcher = new NewsFetcher();
    const allArticles = await newsFetcher.getAllArticles();

    // Filter by category if provided
    const filteredArticles = category
      ? allArticles.filter(article =>
          Array.isArray(article.categories) &&
          article.categories.some(cat =>
            cat.toLowerCase() === category.toLowerCase()
          )
        )
      : allArticles;

    if (filteredArticles.length === 0) {
      console.warn('No articles available, returning frontend defaults');
      const fallbackArticles = getDefaultFrontendArticles();

      return json({
        success: true,
        timestamp: new Date().toISOString(),
        articles: fallbackArticles,
        pagination: {
          page: 1,
          limit: fallbackArticles.length,
          totalArticles: fallbackArticles.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      });
    }

    // Calculate pagination
    const totalArticles = filteredArticles.length;
    const totalPages = Math.max(1, Math.ceil(totalArticles / limit));
    const currentPage = Math.min(page, totalPages);
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedArticles = filteredArticles.slice(startIndex, endIndex);

    console.log(`Returning ${paginatedArticles.length} articles (page ${currentPage}/${totalPages})`);

    return json({
      success: true,
      timestamp: new Date().toISOString(),
      articles: paginatedArticles.map(transformArticleForResponse),
      pagination: {
        page: currentPage,
        limit,
        totalArticles,
        totalPages,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1
      }
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    return json({
      success: false,
      timestamp: new Date().toISOString(),
      error: "Failed to fetch news articles",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
};
