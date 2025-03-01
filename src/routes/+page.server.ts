import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
  try {
    const response = await fetch('/api/news', {
      headers: {
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw error(response.status, `Failed to load news articles: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw error(500, data.error || 'Failed to load articles');
    }

    return {
      articles: data.articles,
      timestamp: data.timestamp
    };
  } catch (err) {
    // If it's already a SvelteKit error, just rethrow it
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }

    console.error('Error loading news:', err);
    throw error(500, 'An unexpected error occurred while loading news articles');
  }
};