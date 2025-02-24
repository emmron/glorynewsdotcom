import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { MongoClient } from 'mongodb';
import type { Article } from '../../../types/article';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/perthglorynews';

export const load: PageServerLoad = async ({ params }) => {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db();
    const article = await db.collection<Article>('articles').findOne({ slug: params.slug });

    if (!article) {
      throw error(404, 'Article not found');
    }

    return {
      article: {
        ...article,
        // Ensure dates are serialized properly
        publishDate: article.publishDate.toISOString(),
        scrapedAt: article.scrapedAt.toISOString(),
        lastModified: article.lastModified?.toISOString(),
      }
    };
  } catch (e) {
    console.error('Error loading article:', e);
    throw error(500, 'Failed to load article');
  } finally {
    await client.close();
  }
}; 