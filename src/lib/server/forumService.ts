import type { ForumCategory, ForumThread, ForumReply } from '$lib/types/forum';
import { getDatabase } from '$lib/server/mongodb';

// Get forum collections
async function getForumCollections() {
  const db = await getDatabase();
  if (!db) {
    console.warn('Database not available for forum operations');
    return null;
  }

  return {
    categories: db.collection<ForumCategory>('forum_categories'),
    threads: db.collection<ForumThread>('forum_threads'),
    replies: db.collection<ForumReply>('forum_replies')
  };
}

// Initialize sample data if database is empty
async function initializeSampleData() {
  const collections = await getForumCollections();
  if (!collections) return;

  const categoryCount = await collections.categories.countDocuments();

  if (categoryCount === 0) {
    const sampleCategories: ForumCategory[] = [
      {
        id: 'general',
        name: 'General Discussion',
        description: 'Talk about anything related to Perth Glory',
        icon: 'message-circle',
        threadCount: 48,
        postCount: 367
      },
      {
        id: 'match-day',
        name: 'Match Day',
        description: 'Pre-match, live and post-match discussions',
        icon: 'calendar',
        threadCount: 124,
        postCount: 2189
      },
      {
        id: 'transfers',
        name: 'Transfers & Rumors',
        description: 'Player transfers, contract news and rumors',
        icon: 'refresh-cw',
        threadCount: 35,
        postCount: 587
      },
      {
        id: 'tactics',
        name: 'Tactics & Analysis',
        description: 'In-depth tactical discussions and match analysis',
        icon: 'layout',
        threadCount: 23,
        postCount: 419
      },
      {
        id: 'youth',
        name: 'Youth Teams',
        description: 'Discussions about Perth Glory\'s youth development',
        icon: 'users',
        threadCount: 17,
        postCount: 201
      },
      {
        id: 'womens',
        name: 'Women\'s Team',
        description: 'Perth Glory Women\'s team discussions',
        icon: 'award',
        threadCount: 29,
        postCount: 356
      }
    ];

    await collections.categories.insertMany(sampleCategories);
    console.log('Initialized sample forum categories');
  }

  const threadCount = await collections.threads.countDocuments();

  if (threadCount === 0) {
    const sampleThreads: ForumThread[] = [
      {
        id: 1,
        title: 'Thoughts on our performance against Sydney FC?',
        category: 'match-day',
        author: 'GloryFan1882',
        replies: 3,
        views: 412,
        lastPostDate: new Date(Date.now() - 1000 * 60 * 30),
        lastPostAuthor: 'PurplePride',
        isPinned: false,
        isLocked: false,
        content: `
          <p>What did everyone think about our performance on Saturday? I thought the defense was really solid for most of the game, especially considering Sydney's attack.</p>
          <p>The midfield struggled a bit to maintain possession in the second half, but overall I think we showed good signs. That counter-attack goal was beautifully executed!</p>
          <p>What do you think we need to work on before next week's match against Victory?</p>
        `,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
      },
      {
        id: 2,
        title: 'Next season\'s kit leaked?',
        category: 'general',
        author: 'PerthTillIDie',
        replies: 45,
        views: 1203,
        lastPostDate: new Date(Date.now() - 1000 * 60 * 60 * 2),
        lastPostAuthor: 'Macca99',
        isPinned: true,
        isLocked: false
      },
      {
        id: 3,
        title: 'Striker options for next season',
        category: 'transfers',
        author: 'TransferGuru',
        replies: 18,
        views: 342,
        lastPostDate: new Date(Date.now() - 1000 * 60 * 60 * 5),
        lastPostAuthor: 'GloryDays94',
        isPinned: false,
        isLocked: false
      }
    ];

    await collections.threads.insertMany(sampleThreads);
    console.log('Initialized sample forum threads');
  }
}

export async function getCategories(): Promise<ForumCategory[]> {
  const collections = await getForumCollections();
  if (!collections) return [];

  await initializeSampleData();

  try {
    return await collections.categories.find().toArray();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function getThreads(): Promise<ForumThread[]> {
  const collections = await getForumCollections();
  if (!collections) return [];

  try {
    return await collections.threads.find().sort({ isPinned: -1, lastPostDate: -1 }).toArray();
  } catch (error) {
    console.error('Error fetching threads:', error);
    return [];
  }
}

export async function getThreadsByCategory(categoryId: string): Promise<ForumThread[]> {
  const collections = await getForumCollections();
  if (!collections) return [];

  try {
    return await collections.threads
      .find({ category: categoryId })
      .sort({ isPinned: -1, lastPostDate: -1 })
      .toArray();
  } catch (error) {
    console.error('Error fetching threads by category:', error);
    return [];
  }
}

export async function getThread(id: number): Promise<ForumThread | null> {
  const collections = await getForumCollections();
  if (!collections) return null;

  try {
    return await collections.threads.findOne({ id });
  } catch (error) {
    console.error('Error fetching thread:', error);
    return null;
  }
}

export async function getRepliesByThread(threadId: number): Promise<ForumReply[]> {
  const collections = await getForumCollections();
  if (!collections) return [];

  try {
    return await collections.replies
      .find({ threadId })
      .sort({ createdAt: 1 })
      .toArray();
  } catch (error) {
    console.error('Error fetching replies:', error);
    return [];
  }
}

export async function addReply(reply: Omit<ForumReply, 'id'>): Promise<ForumReply> {
  const collections = await getForumCollections();
  if (!collections) {
    throw new Error('Database not available. Forum features are disabled.');
  }

  try {
    // Get next ID
    const lastReply = await collections.replies.find().sort({ id: -1 }).limit(1).toArray();
    const newId = lastReply.length > 0 ? lastReply[0].id + 1 : 1;

    const newReply: ForumReply = {
      ...reply,
      id: newId
    };

    await collections.replies.insertOne(newReply);

    // Update thread stats
    await collections.threads.updateOne(
      { id: reply.threadId },
      {
        $inc: { replies: 1 },
        $set: {
          lastPostDate: new Date(),
          lastPostAuthor: reply.author
        }
      }
    );

    return newReply;
  } catch (error) {
    console.error('Error adding reply:', error);
    throw new Error('Failed to add reply to database.');
  }
}

export async function incrementThreadViews(threadId: number): Promise<void> {
  const collections = await getForumCollections();
  if (!collections) return;

  try {
    await collections.threads.updateOne(
      { id: threadId },
      { $inc: { views: 1 } }
    );
  } catch (error) {
    console.error('Error incrementing thread views:', error);
  }
}
