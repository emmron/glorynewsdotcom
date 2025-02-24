import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchNews } from '$lib/news-fetching';
import { MongoClient } from 'mongodb';
import type { Article } from '../../../../types/article';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/perthglorynews';
const CRON_SECRET = process.env.CRON_SECRET;

export const GET: RequestHandler = async ({ request }) => {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (!CRON_SECRET || `Bearer ${CRON_SECRET}` !== authHeader) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = new MongoClient(MONGODB_URI);
  const startTime = Date.now();

  try {
    // Fetch fresh news
    const articles = await fetchNews();

    // Connect to MongoDB
    await client.connect();
    const db = client.db();
    const collection = db.collection<Article>('articles');

    // Update or insert new articles
    const operations = await Promise.all(
      articles.map(async (article) => {
        const result = await collection.updateOne(
          { slug: article.slug },
          { $set: article },
          { upsert: true }
        );
        return {
          slug: article.slug,
          operation: result.upsertedId ? 'inserted' : 'updated'
        };
      })
    );

    // Count operations
    const stats = operations.reduce((acc, op) => {
      acc[op.operation]++;
      return acc;
    }, { inserted: 0, updated: 0 });

    return json({
      success: true,
      stats,
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
  } finally {
    await client.close();
  }
}; 