/**
 * Database setup and index creation
 * Run this manually or on first deployment to set up indexes
 */
import { getDatabase } from './mongodb';

export async function setupDatabaseIndexes() {
  const db = await getDatabase();
  if (!db) {
    console.error('Database not available. Cannot create indexes.');
    return false;
  }

  try {
    console.log('Setting up database indexes...');

    // Users collection indexes
    await db.collection('users').createIndex({ id: 1 }, { unique: true });
    await db.collection('users').createIndex({ emailLower: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    console.log('✓ User indexes created');

    // Comments collection indexes
    await db.collection('comments').createIndex({ articleId: 1, createdAt: -1 });
    await db.collection('comments').createIndex({ id: 1 }, { unique: true });
    console.log('✓ Comment indexes created');

    // Forum categories collection indexes
    await db.collection('forum_categories').createIndex({ id: 1 }, { unique: true });
    console.log('✓ Forum category indexes created');

    // Forum threads collection indexes
    await db.collection('forum_threads').createIndex({ id: 1 }, { unique: true });
    await db.collection('forum_threads').createIndex({ category: 1, lastPostDate: -1 });
    await db.collection('forum_threads').createIndex({ isPinned: -1, lastPostDate: -1 });
    console.log('✓ Forum thread indexes created');

    // Forum replies collection indexes
    await db.collection('forum_replies').createIndex({ id: 1 }, { unique: true });
    await db.collection('forum_replies').createIndex({ threadId: 1, createdAt: 1 });
    console.log('✓ Forum reply indexes created');

    // Articles collection indexes (if using MongoDB for articles)
    await db.collection('articles').createIndex({ slug: 1 }, { unique: true });
    await db.collection('articles').createIndex({ publishDate: -1 });
    await db.collection('articles').createIndex({ club: 1, publishDate: -1 });
    console.log('✓ Article indexes created');

    console.log('All database indexes created successfully!');
    return true;
  } catch (error) {
    console.error('Error creating database indexes:', error);
    return false;
  }
}
