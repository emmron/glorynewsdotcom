import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchNews } from '$lib/news-fetching';
import { MongoClient } from 'mongodb';
import type { Article } from '../../../types/article';
import { MONGODB_URI } from '$env/static/private';

const mongoUri = MONGODB_URI || 'mongodb://localhost:27017/perthglorynews';

export const GET: RequestHandler = async () => {
  const client = new MongoClient(mongoUri);

  try {
    // Fetch fresh news
    const articles = await fetchNews();

    // Connect to MongoDB
    await client.connect();
    const db = client.db();
    const collection = db.collection<Article>('articles');

    // Update or insert new articles
    for (const article of articles) {
      await collection.updateOne(
        { slug: article.slug },
        { $set: article },
        { upsert: true }
      );
    }

    // Get all articles, sorted by date
    const allArticles = await collection
      .find()
      .sort({ publishDate: -1 })
      .limit(50)
      .toArray();

    return json({
      success: true,
      articles: allArticles,
      count: allArticles.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return json({
      success: false,
      error: 'Failed to fetch news',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  } finally {
    await client.close();
  }
};