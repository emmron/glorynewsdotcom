import { error } from '@sveltejs/kit';
import type { LeagueLadder } from '$lib/types';
import { CACHE_DURATIONS } from '$lib/config';
import { fetchALeagueLadder, refreshLadder } from '$lib/services/ladderService';

export async function load({ fetch, setHeaders }) {
  try {
    // Implement proper ladder fetching using our service
    let ladder = await fetchALeagueLadder({
      cache: 'no-store',
      forceRefresh: false
    });

    // Sanity check: If ladder is null or doesn't have teams, try refreshing
    if (!ladder || !ladder.teams || ladder.teams.length === 0) {
      console.warn('Initial ladder data invalid, attempting refresh');
      ladder = await refreshLadder();
    }

    // Additional sanity check: Verify ladder has expected properties
    if (!ladder || !ladder.teams || !ladder.season || !ladder.lastUpdated) {
      console.error('Ladder data failed validation checks');
      throw new Error('Invalid ladder data structure');
    }

    // Verify we have at least 10 teams (A-League has 12 teams)
    if (ladder.teams.length < 10) {
      console.error('Ladder data has insufficient teams:', ladder.teams.length);
      throw new Error('Incomplete ladder data');
    }

    // Set cache headers for the page
    setHeaders({
      'Cache-Control': `max-age=${CACHE_DURATIONS.ladder}, s-maxage=${CACHE_DURATIONS.ladder}`
    });

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