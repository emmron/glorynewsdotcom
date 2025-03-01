import { error } from '@sveltejs/kit';
import type { LeagueLadder } from '$lib/types';
import { CACHE_DURATIONS } from '$lib/config';

// Just use the API endpoint directly
export async function load() {
  try {
    // Laziest possible implementation - just call our own API
    const response = await fetch('/api/ladder');

    if (!response.ok) {
      throw new Error(`Failed to fetch ladder: ${response.status}`);
    }

    const ladder = await response.json();

    return {
      ladder,
      error: null
    };
  } catch (err) {
    console.error('¯\\_(ツ)_/¯ whatever:', err);

    return {
      ladder: null,
      error: {
        message: 'Ladder broke lol',
        status: 500
      }
    };
  }
}