import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { MongoClient } from 'mongodb';
import type { Article } from '../../../types/article';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/perthglorynews';

export const load: PageServerLoad = async ({ params, url }) => {
  const client = new MongoClient(MONGODB_URI);
  const clubFilter = url.searchParams.get('club') || 'All Clubs';

  try {
    await client.connect();
    const db = client.db();

    // Get main article
    const article = await db.collection<Article>('articles').findOne({ slug: params.slug });

    // Get related articles with club filter
    const relatedArticles = await db.collection<Article>('articles')
      .find({
        slug: { $ne: params.slug },
        ...(clubFilter !== 'All Clubs' && { club: clubFilter })
      })
      .limit(3)
      .toArray();

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
      },
      relatedArticles: relatedArticles.map(article => ({
        ...article,
        publishDate: article.publishDate.toISOString()
      })),
      initialClub: clubFilter
    };
  } catch (e) {
    console.error('Error loading article:', e);
    throw error(500, 'Failed to load article');
  } finally {
    await client.close();
  }
};