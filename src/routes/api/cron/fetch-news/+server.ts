import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchGloryNews } from '$lib/services/newsService';
import { Redis } from '@upstash/redis';

const CRON_SECRET = process.env.CRON_SECRET;
const REDIS_URL = process.env.UPSTASH_REDIS_URL || '';
const REDIS_TOKEN = process.env.UPSTASH_REDIS_TOKEN || '';

export const GET: RequestHandler = async ({ request }) => {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (!CRON_SECRET || `Bearer ${CRON_SECRET}` !== authHeader) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const redis = new Redis({
    url: REDIS_URL,
    token: REDIS_TOKEN
  });

  const startTime = Date.now();

  try {
    // Fetch fresh news
    const articles = await fetchGloryNews();

    // Store in Redis
    await redis.set('latest_news', articles);
    await redis.set('news_last_updated', new Date().toISOString());

    return json({
      success: true,
      count: articles.length,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return json({
      success: false,
      error: 'Failed to fetch and update news',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
};