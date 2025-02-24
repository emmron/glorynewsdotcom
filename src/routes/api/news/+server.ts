import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchNews } from '$lib/news-fetching';
import { Redis } from '@upstash/redis';

const REDIS_URL = process.env.UPSTASH_REDIS_URL || '';
const REDIS_TOKEN = process.env.UPSTASH_REDIS_TOKEN || '';

export const GET: RequestHandler = async () => {
  try {
    // Try to get news from Redis first
    const redis = new Redis({
      url: REDIS_URL,
      token: REDIS_TOKEN
    });

    let articles = await redis.get('latest_news');
    const lastUpdated = await redis.get('news_last_updated');

    // If not in Redis or data is too old, fetch fresh news
    if (!articles || !Array.isArray(articles) || articles.length === 0) {
      articles = await fetchNews();

      // Store in Redis for future requests
      await redis.set('latest_news', articles);
      await redis.set('news_last_updated', new Date().toISOString());
    }

    return json({
      success: true,
      articles,
      count: articles.length,
      lastUpdated,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching news:', error);

    // Attempt to fetch news directly as fallback
    try {
      const articles = await fetchNews();
      return json({
        success: true,
        articles,
        count: articles.length,
        fromFallback: true,
        timestamp: new Date().toISOString()
      });
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      return json({
        success: false,
        error: 'Failed to fetch news',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
  }
};