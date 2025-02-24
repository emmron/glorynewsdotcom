import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchNews } from '$lib/news-fetching';

export const GET: RequestHandler = async () => {
  try {
    // Fetch fresh news
    const articles = await fetchNews();

    return json({
      success: true,
      articles,
      count: articles.length,
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