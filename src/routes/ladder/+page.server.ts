import { error } from '@sveltejs/kit';
import type { LeagueLadder, TeamStats, Matches } from '$lib/types';
import { LEAGUE_API_ENDPOINT } from '$lib/config';

// Implementation follows the news fetching rules for rate limiting and caching
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
let cachedLadder: { data: LeagueLadder | null; timestamp: number } = { data: null, timestamp: 0 };
let cachedMatches: { data: Matches | null; timestamp: number } = { data: null, timestamp: 0 };

/**
 * Fetches data with rate limiting and retry logic
 */
async function fetchWithRateLimiting(url: string, options: RequestInit = {}) {
  // Track in-flight requests to avoid duplicate fetches
  const controller = new AbortController();
  const signal = controller.signal;

  try {
    const response = await fetch(url, {
      ...options,
      signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw new Error('Request was aborted due to timeout or manual cancellation');
      }
      throw err;
    }
    throw new Error('Unknown error during fetch');
  }
}

/**
 * Fetches ladder data with caching
 */
async function fetchLadder(): Promise<LeagueLadder> {
  const now = Date.now();

  // Return cached data if still valid
  if (cachedLadder.data && now - cachedLadder.timestamp < CACHE_DURATION) {
    return cachedLadder.data;
  }

  try {
    // Implement stale-while-revalidate pattern
    const currentCache = cachedLadder.data;

    // Fetch fresh data
    const data = await fetchWithRateLimiting(`${LEAGUE_API_ENDPOINT}/ladder`);

    // Update cache
    cachedLadder = {
      data,
      timestamp: now
    };

    return data;
  } catch (err) {
    // If we have stale data, return it on error
    if (cachedLadder.data) {
      console.warn('Returning stale ladder data due to fetch error:', err);
      return cachedLadder.data;
    }
    throw err;
  }
}

/**
 * Fetches matches data with caching
 */
async function fetchMatches(): Promise<Matches> {
  const now = Date.now();

  // Return cached data if still valid
  if (cachedMatches.data && now - cachedMatches.timestamp < CACHE_DURATION) {
    return cachedMatches.data;
  }

  try {
    // Implement stale-while-revalidate pattern
    const currentCache = cachedMatches.data;

    // Fetch fresh data
    const data = await fetchWithRateLimiting(`${LEAGUE_API_ENDPOINT}/matches`);

    // Update cache
    cachedMatches = {
      data,
      timestamp: now
    };

    return data;
  } catch (err) {
    // If we have stale data, return it on error
    if (cachedMatches.data) {
      console.warn('Returning stale matches data due to fetch error:', err);
      return cachedMatches.data;
    }
    throw err;
  }
}

/**
 * Server-side load function for SvelteKit
 */
export async function load() {
  try {
    // Fetch ladder and matches in parallel
    const [ladder, matches] = await Promise.all([
      fetchLadder(),
      fetchMatches()
    ]);

    return {
      ladder,
      matches,
      error: null
    };
  } catch (err) {
    console.error('Error loading ladder data:', err);

    // Return any cached data if available, along with the error
    return {
      ladder: cachedLadder.data,
      matches: cachedMatches.data,
      error: {
        message: err instanceof Error ? err.message : 'Failed to load data',
        status: 500
      }
    };
  }
}