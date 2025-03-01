import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
  try {
    const response = await fetch('/api/ladder', {
      headers: {
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw error(response.status, `Failed to load ladder: ${response.statusText}`);
    }

    const ladderData = await response.json();

    return {
      ladder: ladderData,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    // If it's already a SvelteKit error, just rethrow it
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }

    console.error('Error loading ladder:', err);
    throw error(500, 'An unexpected error occurred while loading ladder data');
  }
};