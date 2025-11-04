import type { RequestHandler } from './$types';
import type { Comment } from '../../../../types/comment';
import { json } from '@sveltejs/kit';
import { getDatabase } from '$lib/server/mongodb';

// Get comments collection
async function getCommentsCollection() {
  const db = await getDatabase();
  if (!db) {
    console.warn('Database not available for comment operations');
    return null;
  }
  return db.collection<Comment>('comments');
}

// Load comments for an article
async function loadComments(articleId: string): Promise<Comment[]> {
  const comments = await getCommentsCollection();
  if (!comments) return [];

  try {
    const results = await comments
      .find({ articleId })
      .sort({ createdAt: -1 })
      .toArray();
    return results;
  } catch (error) {
    console.error('Failed to load comments:', error);
    return [];
  }
}

// Save a new comment
async function saveComment(comment: Comment): Promise<void> {
  const comments = await getCommentsCollection();
  if (!comments) {
    throw new Error('Database not available. Comments are disabled.');
  }

  try {
    await comments.insertOne(comment);
  } catch (error) {
    console.error('Failed to save comment:', error);
    throw new Error('Failed to save comment to database.');
  }
}

export const GET: RequestHandler = async ({ params }) => {
  const { articleId } = params;
  if (!articleId) {
    return json({ error: 'Article ID is required' }, { status: 400 });
  }

  try {
    const comments = await loadComments(articleId);
    return json(comments);
  } catch (error) {
    console.error(`Error loading comments for article ${articleId}:`, error);
    return json({ error: 'Failed to load comments' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request, params }) => {
  const { articleId } = params;
  if (!articleId) {
    return json({ error: 'Article ID is required' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { authorName, text } = body;

    if (!authorName || !text) {
      return json({ error: 'Author name and text are required' }, { status: 400 });
    }

    // Create new comment
    const newComment: Comment = {
      id: crypto.randomUUID(),
      articleId,
      authorName,
      text,
      createdAt: new Date(),
    };

    // Save comment to database
    await saveComment(newComment);

    return json(newComment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create comment';
    return json({ error: errorMessage }, { status: 500 });
  }
};