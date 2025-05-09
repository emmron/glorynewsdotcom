import type { Article } from '../types/article';

/**
 * Fetch all articles from the database
 */
export async function fetchArticles(club?: string): Promise<Article[]> {
  try {
    const url = `/api/news${club ? `?club=${encodeURIComponent(club)}` : ''}`;
    const response = await fetch(url);

    if (!response.ok) throw new Error(`Failed to fetch articles: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

/**
 * Fetch a single article by ID
 */
export async function fetchArticleById(id: string): Promise<Article | null> {
  try {
    const response = await fetch(`/api/news/${id}`);
    if (!response.ok) throw new Error(`Failed to fetch article: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching article ${id}:`, error);
    return null;
  }
}