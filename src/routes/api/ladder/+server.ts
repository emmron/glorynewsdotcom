import type { RequestEvent } from '@sveltejs/kit';
import type { LeagueLadder, TeamStats } from '$lib/types';

// In-memory cache with stale-while-revalidate pattern
interface CacheEntry {
    data: LeagueLadder;
    timestamp: number;
    stale: boolean;
}

let ladderCache: CacheEntry | null = null;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes as per rules
const STALE_WHILE_REVALIDATE = 60 * 60 * 1000; // 1 hour

// Rate limiting
const RATE_LIMIT_WINDOW = 10000; // 10 seconds
const MAX_REQUESTS_PER_WINDOW = 2;
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
    // In a real implementation, this would fetch from an external API
    // For now, we'll use mock data but structure it for easy replacement
    const initialTeams: Omit<TeamStats, 'position'>[] = [
        {
            teamName: "Central Coast Mariners",
            played: 10,
            won: 7,
            drawn: 2,
            lost: 1,
            goalsFor: 16,
            goalsAgainst: 8,
            goalDifference: 8,
            points: 23,
            form: ["W", "D", "L", "W", "D"],
            logo: ""
        },
        {
            teamName: "Melbourne City",
            played: 11,
            won: 6,
            drawn: 3,
            lost: 2,
            goalsFor: 20,
            goalsAgainst: 10,
            goalDifference: 10,
            points: 21,
            form: ["D", "D", "D", "W", "W"],
            logo: ""
        },
        {
            teamName: "Adelaide United",
            played: 10,
            won: 6,
            drawn: 3,
            lost: 1,
            goalsFor: 24,
            goalsAgainst: 16,
            goalDifference: 8,
            points: 21,
            form: ["W", "W", "D", "L", "W"],
            logo: ""
        },
        {
            teamName: "Brisbane Roar",
            played: 11,
            won: 0,
            drawn: 2,
            lost: 9,
            goalsFor: 12,
            goalsAgainst: 26,
            goalDifference: -14,
            points: 2,
            form: ["L", "L", "L", "L", "L"],
            logo: ""
        }
    ];

    // Sort teams by points and goal difference
    initialTeams.sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);

    // Add positions to create final TeamStats array
    const teams: TeamStats[] = initialTeams.map((team, index) => ({
        ...team,
        position: index + 1
    }));

    return {
        lastUpdated: new Date().toISOString(),
        teams,
        leagueName: "A-League Men",
        season: "2023/24"
    };
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