import { error } from '@sveltejs/kit';
import type { LeagueLadder } from '$lib/types';
import { CACHE_DURATIONS } from '$lib/config';
import { fetchALeagueLadder } from '$lib/services/ladderService';

export async function load({ fetch, setHeaders }) {
  try {
    // Implement proper ladder fetching using our service
    const ladder = await fetchALeagueLadder({
      cache: 'no-store',
      forceRefresh: false
    });

    // Set cache headers for the page
    if (ladder) {
      setHeaders({
        'Cache-Control': `max-age=${CACHE_DURATIONS.ladder}, s-maxage=${CACHE_DURATIONS.ladder}`
      });
    }

    return {
      ladder,
      error: null
    };
  } catch (err) {
    console.error('Error fetching ladder data:', err);

    // Return a more helpful error
    return {
      ladder: null,
      error: {
        message: 'Unable to load ladder data. Please try again later.',
        status: 500,
        details: err instanceof Error ? err.message : 'Unknown error'
      }
    };
  }
}