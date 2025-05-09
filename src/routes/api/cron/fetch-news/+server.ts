import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { NewsFetcher } from '$lib/services/newsFetcher';

const CRON_SECRET = process.env.CRON_SECRET || 'dev-cron-secret'; // Fallback for development

export const GET: RequestHandler = async ({ request }) => {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (`Bearer ${CRON_SECRET}` !== authHeader) {
    console.error('Unauthorized cron attempt');
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('Starting cron job to fetch news...');
  const startTime = Date.now();

  try {
    // Use our news fetcher to refresh all sources
    const newsFetcher = new NewsFetcher();
    console.log('News fetcher initialized');

    // Clear the cache to ensure we get fresh data
    await newsFetcher.clearCache();
    console.log('Cache cleared');

    // Fetch all articles from all sources
    console.log('Fetching articles from all sources...');
    const sourceArticles = await newsFetcher.fetchAllSources();
    console.log('Fetched articles from all sources');

    // Count total articles
    const totalArticles = Object.values(sourceArticles)
      .reduce((sum, articles) => sum + articles.length, 0);

    // Metrics by source
    const sourceMetrics = Object.entries(sourceArticles).map(([source, articles]) => ({
      source,
      count: articles.length,
      fallbacks: source === 'fallback' ? articles.length : 0
    }));

    const duration = Date.now() - startTime;
    console.log(`Cron job completed in ${duration}ms, fetched ${totalArticles} articles`);

    return json({
      success: true,
      count: totalArticles,
      sources: sourceMetrics,
      duration,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Cron job error:', errorMessage);

    return json({
      success: false,
      error: 'Failed to fetch and update news',
      message: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
};