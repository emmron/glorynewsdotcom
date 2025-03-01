import type { RequestEvent } from '@sveltejs/kit';
import type { LeagueLadder, TeamStats } from '$lib/types';
import axios from 'axios';
import { LEAGUE_API_ENDPOINT, CACHE_DURATIONS, API_RATE_LIMIT, RETRY_STRATEGY } from '$lib/config';

// In-memory cache with stale-while-revalidate pattern
interface CacheEntry {
    data: LeagueLadder;
    timestamp: number;
    stale: boolean;
}

let ladderCache: CacheEntry | null = null;
const CACHE_DURATION = CACHE_DURATIONS.ladder;
const STALE_WHILE_REVALIDATE = 60 * 60 * 1000; // 1 hour

// Rate limiting
const RATE_LIMIT_WINDOW = API_RATE_LIMIT.windowMs;
const MAX_REQUESTS_PER_WINDOW = API_RATE_LIMIT.requestsPerWindow;
let requestTimestamps: number[] = [];

function checkRateLimit(): boolean {
    const now = Date.now();
    requestTimestamps = requestTimestamps.filter(timestamp =>
        now - timestamp < RATE_LIMIT_WINDOW
    );

    if (requestTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
        return false;
    }

    requestTimestamps.push(now);
    return true;
}

async function fetchLadderData(): Promise<LeagueLadder> {
    let retries = 0;
    const maxRetries = RETRY_STRATEGY.maxRetries;
    const initialDelay = RETRY_STRATEGY.initialDelayMs;
    
    while (retries <= maxRetries) {
        try {
            // Fetch data from the actual API endpoint
            const response = await axios.get(`${LEAGUE_API_ENDPOINT}/ladder`);
            
            if (response.status === 200 && response.data) {
                return response.data as LeagueLadder;
            }
            
            throw new Error(`Received invalid response: ${response.status}`);
        } catch (error) {
            retries++;
            if (retries > maxRetries) {
                console.error('Max retries reached when fetching ladder data');
                throw error;
            }
            
            // Exponential backoff
            const delay = initialDelay * Math.pow(2, retries - 1);
            console.log(`Retry ${retries}/${maxRetries} after ${delay}ms`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    throw new Error('Failed to fetch ladder data after retries');
}

export async function GET({ request }: RequestEvent) {
    try {
        // Check rate limit
        if (!checkRateLimit()) {
            return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'Retry-After': (RATE_LIMIT_WINDOW / 1000).toString()
                }
            });
        }

        const now = Date.now();
        let shouldFetchFresh = false;

        // Check cache status
        if (!ladderCache) {
            shouldFetchFresh = true;
        } else {
            const age = now - ladderCache.timestamp;
            if (age > CACHE_DURATION) {
                // Mark as stale but still usable
                ladderCache.stale = true;
                shouldFetchFresh = true;
            }
        }

        // If cache is stale or missing, fetch new data
        if (shouldFetchFresh) {
            try {
                const freshData = await fetchLadderData();
                ladderCache = {
                    data: freshData,
                    timestamp: now,
                    stale: false
                };
            } catch (error) {
                console.error('Error fetching fresh ladder data:', error);
                // If we have stale data, continue using it
                if (!ladderCache) {
                    throw error;
                }
            }
        }

        // Return the data with appropriate cache headers
        return new Response(JSON.stringify(ladderCache.data), {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': `public, s-maxage=${CACHE_DURATION / 1000}, stale-while-revalidate=${STALE_WHILE_REVALIDATE / 1000}`,
                'X-Cache-Status': ladderCache.stale ? 'stale' : 'fresh',
                'Last-Modified': new Date(ladderCache.timestamp).toUTCString()
            }
        });
    } catch (err) {
        console.error('Error in ladder API:', err);
        return new Response(JSON.stringify({
            error: 'Failed to fetch ladder data',
            message: err instanceof Error ? err.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store'
            }
        });
    }
}