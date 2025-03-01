import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { NewsFetcher } from '$lib/services/newsFetcher';
import type { Article } from '$lib/types/news';

// Convert our Article type to the format expected by the frontend
function transformArticleForResponse(article: Article) {
  // Make sure we handle dates properly
  const publishDate = article.publishDate instanceof Date
    ? article.publishDate
    : new Date(article.publishDate);

  return {
    id: article.id,
    title: article.title,
    content: article.content,
    summary: article.content.replace(/<[^>]+>/g, '').substring(0, 200) + '...',
    date: publishDate.toISOString(),
    imageUrl: article.images.featured || '/images/default-news.jpg',
    category: article.categories[0] || 'News',
    source: 'Perth Glory',
    sourceUrl: article.sourceUrl,
    author: article.author || 'Perth Glory News',

    // Add fields to match what the frontend expects
    slug: article.id,
    excerpt: article.content.replace(/<[^>]+>/g, '').substring(0, 200) + '...',
    publishDate: publishDate.toISOString(),
    featuredImage: article.images.featured || '/images/default-news.jpg',
    sourceName: 'Perth Glory',
    readTime: article.metadata.readingTime,
    scrapedAt: publishDate.toISOString(),
    lastModified: publishDate.toISOString(),
    tags: article.tags,
    status: 'published'
  };
}

export const GET: RequestHandler = async ({ params }) => {
  try {
    const { id } = params;

    if (!id) {
      return json({
        success: false,
        error: 'Article ID is required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    const newsFetcher = new NewsFetcher();
    const article = await newsFetcher.getArticleById(id);

    if (!article) {
      return json({
        success: false,
        error: 'Article not found',
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }

    // Transform for response
    const transformedArticle = transformArticleForResponse(article);

    return json({
      success: true,
      article: transformedArticle,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error fetching article:`, error);

    return json({
      success: false,
      error: 'Failed to fetch article',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
};