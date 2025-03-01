import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { NewsFetcher } from '$lib/services/newsFetcher';

const CRON_SECRET = process.env.CRON_SECRET;

export const GET: RequestHandler = async ({ request }) => {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (!CRON_SECRET || `Bearer ${CRON_SECRET}` !== authHeader) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();

  try {
    // Use our new news fetcher to refresh all sources
    const newsFetcher = new NewsFetcher();

    // Clear the cache to ensure we get fresh data
    await newsFetcher.clearCache();

    // Fetch all articles from all sources
    const sourceArticles = await newsFetcher.fetchAllSources();

    // Count total articles
    const totalArticles = Object.values(sourceArticles)
      .reduce((sum, articles) => sum + articles.length, 0);

    // Metrics by source
    const sourceMetrics = Object.entries(sourceArticles).map(([source, articles]) => ({
      source,
      count: articles.length
    }));

    return json({
      success: true,
      count: totalArticles,
      sources: sourceMetrics,
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