import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { NewsFetcher } from '$lib/services/newsFetcher';
import type { Article } from '$lib/types/news';

// Convert our Article type to the format expected by the frontend
function transformArticleForResponse(article: Article) {
  return {
    id: article.id,
    title: article.title,
    content: article.content,
    summary: article.content.replace(/<[^>]+>/g, '').substring(0, 200) + '...',
    date: article.publishDate.toISOString(),
    imageUrl: article.images.featured || '/images/default-news.jpg',
    category: article.categories[0] || 'News'
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