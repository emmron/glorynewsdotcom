import type { RequestEvent } from '@sveltejs/kit';
import type { RecentMatches } from '$lib/types';

// In-memory cache
let matchesCache: RecentMatches | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET({ request }: RequestEvent) {
    try {
        const now = Date.now();
        
        // Check if we need to refresh the cache
        if (!matchesCache || now - lastFetchTime > CACHE_DURATION) {
            // Static match data
            matchesCache = {
                lastUpdated: new Date().toISOString(),
                matches: [
                    {
                        date: '2024-03-09T09:45:00.000Z',
                        competition: 'A-League Men',
                        homeTeam: {
                            name: 'Perth Glory',
                            logo: 'https://www.keepup.com.au/images/teams/perth-glory.svg',
                            score: 2
                        },
                        awayTeam: {
                            name: 'Melbourne Victory',
                            logo: 'https://www.keepup.com.au/images/teams/melbourne-victory.svg',
                            score: 1
                        },
                        venue: 'HBF Park',
                        isCompleted: true
                    },
                    {
                        date: '2024-03-02T09:45:00.000Z',
                        competition: 'A-League Men',
                        homeTeam: {
                            name: 'Sydney FC',
                            logo: 'https://www.keepup.com.au/images/teams/sydney-fc.svg',
                            score: 2
                        },
                        awayTeam: {
                            name: 'Perth Glory',
                            logo: 'https://www.keepup.com.au/images/teams/perth-glory.svg',
                            score: 2
                        },
                        venue: 'Allianz Stadium',
                        isCompleted: true
                    },
                    {
                        date: '2024-02-24T09:45:00.000Z',
                        competition: 'A-League Men',
                        homeTeam: {
                            name: 'Perth Glory',
                            logo: 'https://www.keepup.com.au/images/teams/perth-glory.svg',
                            score: 1
                        },
                        awayTeam: {
                            name: 'Melbourne City',
                            logo: 'https://www.keepup.com.au/images/teams/melbourne-city.svg',
                            score: 1
                        },
                        venue: 'HBF Park',
                        isCompleted: true
                    }
                ]
            };
            lastFetchTime = now;
        }
        
        return new Response(JSON.stringify(matchesCache), {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=300' // 5 minutes browser caching
            }
        });
    } catch (err) {
        console.error('Error fetching matches:', err);
        return new Response(JSON.stringify({ error: 'Failed to fetch match data' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
} 