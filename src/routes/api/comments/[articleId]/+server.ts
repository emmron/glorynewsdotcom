import type { RequestHandler } from './$types';
import type { Comment } from '../../../../types/comment';
import { json } from '@sveltejs/kit';
import { promises as fs } from 'fs';
import * as path from 'path';

// Define the storage directory for comments
const COMMENTS_DIR = path.resolve('static/data/comments');

// Ensure comments directory exists
async function ensureCommentsDir() {
  try {
    await fs.mkdir(COMMENTS_DIR, { recursive: true });
  } catch (error) {
    console.warn('Failed to create comments directory (serverless environment):', error);
    // This is expected in serverless environments and should not crash
  }
}

// Get comments file path for an article
function getCommentsFilePath(articleId: string): string {
  return path.join(COMMENTS_DIR, `${articleId}.json`);
}

// Load comments for an article
async function loadComments(articleId: string): Promise<Comment[]> {
  await ensureCommentsDir();
  const filePath = getCommentsFilePath(articleId);

  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or has invalid content, return empty array
    return [];
  }
}

// Save comments for an article
async function saveComments(articleId: string, comments: Comment[]): Promise<void> {
  await ensureCommentsDir();
  const filePath = getCommentsFilePath(articleId);

  try {
    await fs.writeFile(filePath, JSON.stringify(comments, null, 2), 'utf-8');
  } catch (error) {
    console.warn(`Failed to save comments for article ${articleId} (serverless environment):`, error);
    throw new Error('Comment storage not available in serverless environment. Please configure a database.');
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

    // Load existing comments
    const comments = await loadComments(articleId);

    // Create new comment
    const newComment: Comment = {
      id: crypto.randomUUID(), // Use UUID for production-ready IDs
      articleId,
      authorName,
      text,
      createdAt: new Date(),
    };

    // Add comment and save
    comments.push(newComment);
    await saveComments(articleId, comments);

    return json(newComment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return json({ error: 'Failed to create comment' }, { status: 500 });
  }
};