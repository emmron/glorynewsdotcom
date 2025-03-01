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

    // Add these fields to match what the frontend expects
    slug: article.id, // Use ID as slug
    excerpt: article.content.replace(/<[^>]+>/g, '').substring(0, 200) + '...',
    publishDate: publishDate.toISOString(),
    featuredImage: article.images.featured || '/images/default-news.jpg',
    sourceName: 'Perth Glory',
    author: article.author || 'Perth Glory',

    // Optional fields
    source: 'Perth Glory',
    sourceUrl: article.sourceUrl
  };
}

export const GET: RequestHandler = async () => {
  try {
    const newsFetcher = new NewsFetcher();

    // Get all articles
    const articles = await newsFetcher.getAllArticles();

    // Transform for response
    const transformedArticles = articles.map(transformArticleForResponse);

    return json({
      success: true,
      articles: transformedArticles,
      count: transformedArticles.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching news:', error);

    return json({
      success: false,
      error: 'Failed to fetch news',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
};