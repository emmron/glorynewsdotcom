import { error } from '@sveltejs/kit';

export const load = async ({ fetch }: { fetch: any }) => {
  try {
    // Fetch both ladder and matches data in parallel
    const [ladderResponse, matchesResponse] = await Promise.all([
      fetch('/api/ladder', {
        headers: {
          'Cache-Control': 'no-cache'
        }
      }),
      fetch('/api/matches', {
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
    ]);

    if (!ladderResponse.ok) {
      throw error(ladderResponse.status, `Failed to load ladder: ${ladderResponse.statusText}`);
    }

    if (!matchesResponse.ok) {
      throw error(matchesResponse.status, `Failed to load matches: ${matchesResponse.statusText}`);
    }

    const ladderData = await ladderResponse.json();
    const matchesData = await matchesResponse.json();

    return {
      ladder: ladderData,
      matches: matchesData,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    // If it's already a SvelteKit error, just rethrow it
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }

    console.error('Error loading ladder data:', err);
    throw error(500, 'An unexpected error occurred while loading ladder data');
  }
};